use std::collections::HashMap;

use streamdal_gjson as gjson;
use streamdal_gjson::Value;

#[derive(Debug, Clone)]
pub struct KeywordMatch {
    pub path: String,
    pub value: String,
    pub confidence: f32,
    pub entity: String,
}

#[derive(Debug, Clone)]
pub struct Field {
    pub parent_path: Vec<String>,
    pub children: Vec<Field>,
    pub key_name: String,
    pub value: String,
    pub pii_matches: Vec<KeywordMatch>,
    pub json_type: gjson::Kind,
    pub confidence: f32,
}

impl Field {
    /// Returns the full path of a field in the JSON payload
    pub fn path(&self) -> String {
        if self.parent_path.is_empty() {
            return self.key_name.clone().to_lowercase();
        }

        // Strip numbers
        let cleaned: String = self.key_name.chars().filter(|&c| !c.is_numeric()).collect();

        format!("{}.{}", self.parent_path.join("."), cleaned.to_lowercase())
    }
}


#[derive(Debug, Clone)]
pub struct Keyword {
    pub entity: String,
    pub score: i32,
}

impl Keyword {
    pub fn new(entity: &str, score: i32) -> Self {
        Keyword {
            entity: entity.to_string(),
            score,
        }
    }
}

pub struct FieldPII {
    pub scalar_keywords: HashMap<String, Keyword>,
    pub path_keywords: HashMap<String, Keyword>,
}

impl FieldPII {
    /// Initialize a new FieldPII struct with a HashMap of keywords
    /// Keywords are a HashMap of keyword name to Keyword struct
    /// Keyword is struct contains the entity type and score
    pub fn new(keywords: HashMap<String, Keyword>) -> FieldPII {
        let mut partial_match_against = HashMap::new();
        let mut match_against = HashMap::new();
        for (key_name, def) in keywords {
            if key_name.contains('.') {
                // format!() is a bit of a hit over all the keywords every time, so let's precompute
                let suffix = format!(".{}", key_name);
                partial_match_against.insert(suffix, def.clone());
            } else {
                match_against.insert(key_name.clone(), def.clone());
            }
        }

        FieldPII {
            scalar_keywords: match_against,
            path_keywords: partial_match_against,
        }
    }

    pub fn scan(&mut self, payload: &str) -> Vec<Field> {
        let parsed = gjson::parse(payload);
        self.recurse_payload(parsed, vec![])
    }

    /// Recursively scan a JSON payload for PII based by matching keywords with the JSON
    /// field name or path
    fn recurse_payload(&mut self, current: Value, parent: Vec<String>) -> Vec<Field> {
        let mut fields: Vec<Field> = Vec::new();

        current.each(|key, value| {
            let mut key_str = key.to_string();
            if key_str.is_empty() {
                // # indicates we're inside-of an array. This is gjson's syntax.
                key_str = "#".to_string();
            }

            let mut f = Field {
                key_name: key_str.clone(),
                parent_path: parent.clone(),
                json_type: value.kind(),
                value: "".to_string(),
                pii_matches: Vec::new(),
                children: Vec::new(),
                confidence: 0.0,
            };

            match value.kind() {
                gjson::Kind::Object => {
                    let mut pp = parent.clone();
                    pp.push(key_str.clone());
                    f.children = self.recurse_payload(value, pp);
                }
                gjson::Kind::Array => {
                    let mut pp = parent.clone();
                    pp.push(key_str.clone());
                    f.children = self.recurse_payload(value, pp);
                }
                gjson::Kind::Null | gjson::Kind::True | gjson::Kind::False => {
                    // Ignore null/bool values, since there's no way they could contain PII
                    return true;
                }
                _ => {
                    // Ignore empty values, since there's no way they could contain PII
                    if value.str() == "" {
                        return true;
                    }

                    // Field has a scalar value, set it on the match for reference
                    f.value = value.to_string();
                }
            }

            f.pii_matches.extend(self.match_against_fields(&f));

            let mut confidence_sum: f32 = 0.0;
            f.pii_matches.iter().for_each(|m| {
                confidence_sum += m.confidence;
            });
            if confidence_sum > 100.0 {
                confidence_sum = 100.0;
            }
            f.confidence = confidence_sum;

            f.pii_matches.iter_mut().for_each(|m| {
                m.confidence = confidence_sum;
            });

            fields.push(f);

            true
        });

        fields
    }

    /// Match a field against our keyword lists
    /// There are two lists computed at initialization:
    /// 1. scalar_keywords: A list of single keywords to match against
    /// 2. path_keywords: A list of keywords with periods in them to match against. These represent
    ///          a path in the JSON payload
    /// scalar_keywords will be a O(1) lookup
    /// strict path_keywords will be a O(1) lookup
    /// fuzzy path_keywords will be a O(n) lookup
    fn match_against_fields(&mut self, f: &Field) -> Vec<KeywordMatch> {
        let mut matches: Vec<KeywordMatch> = Vec::new();

        // Single keyword lookup
        //
        // Example payload {"config": {"github": {"token": "pat_90210"}}}
        // Example key match: "token"
        //
        // O1 lookup
        let key_name = clean_key(f.key_name.to_lowercase().as_str());
        if self.scalar_keywords.contains_key(&key_name) {
            let def = self.scalar_keywords.get(&key_name).unwrap(); // safe unwrap

            let m = KeywordMatch {
                path: f.path(),
                value: f.value.clone(),
                confidence: def.score as f32,
                entity: def.entity.clone(),
            };

            matches.push(m);
            return matches;
        }

        // Path keys get cleaned by path
        let cur_path = f.path();

        // Explicit path check here
        // We didn't match on a single key such as "cvv" or "ssn". So let's check
        // our list of explicit paths. These are keywords with a period in them
        //
        // Example payload {"config": {"github": {"token": "pat_90210"}}}
        // Example key match: "config.github.token"
        //
        // O(1) lookup
        if self
            .path_keywords
            .contains_key(cur_path.trim_start_matches('.'))
        {
            let def = self.path_keywords.get(cur_path.as_str()).unwrap(); // safe unwrap

            let m = KeywordMatch {
                path: f.path(),
                value: f.value.clone(),
                confidence: def.score as f32,
                entity: def.entity.clone(),
            };

            matches.push(m);
            return matches;
        }

        // Partial match check here
        // We didn't match on the whole key, such as "cvv", and we didn't match
        // on a whole path, such as "config.github.token". So let's check each keyword path
        // and see if our current path ends with that keyword path
        //
        // Example payload {"config": {"github": {"token": "pat_90210"}}}
        // Example key match: "github.token"
        //
        // O(n) lookup
        for (key_name, def) in &self.path_keywords {
            if cur_path.ends_with(key_name.as_str()) {
                let m = KeywordMatch {
                    path: cur_path,
                    value: f.value.clone(),
                    confidence: def.score as f32,
                    entity: def.entity.clone(),
                };

                matches.push(m);
                return matches;
            }
        }

        matches
    }
}

/// Iterate over fields and print all PII matches.
/// Used for debugging
#[allow(dead_code)]
pub fn print_paths(fields: &[Field]) {
    fields.iter().for_each(|f| {
        f.pii_matches.iter().for_each(|m| {
            println!("{:#?}", m);
        });
        print_paths(&f.children);
    });
}

/// Strips numbers and leading/trailing underscores from a key
fn clean_key(input: &str) -> String {
    // Strip numbers
    let cleaned: String = input.chars().filter(|&c| !c.is_numeric()).collect();

    // Strip underscores from prefix and suffix
    cleaned.trim_matches('_').to_string()
}

// Used to load a keyword toml file into a HashMap
//#[allow(dead_code)]
// pub fn parse_keywords(toml_string: &str) -> HashMap<String, Keyword> {
//     let map = HashMap::new();
//     let value: toml::Value = toml::from_str(toml_string).unwrap();
//
//     if let toml::Value::Table(table) = value {
//         for (section_name, section_value) in table {
//             if let toml::Value::Table(inner_table) = section_value {
//                 for (key, value) in inner_table {
//                     if let toml::Value::Integer(score) = value {
//                         //let keyword = Keyword::new(section_name.as_str(), score as i32);
//                         //map.insert(key, keyword);
//                         // println!(
//                         //     "(\"{}\".to_string(), Keyword {{entity: \"{}\".to_string(), score: {}}}),",
//                         //     &key,
//                         //     section_name.clone(),
//                         //     score
//                         // )
//                         println!(
//                             "(\"{}\".to_string(), Keyword::new(\"{}\", {})),",
//                             &key,
//                             section_name.clone(),
//                             score
//                         )
//                     }
//                 }
//             }
//         }
//     }
//
//     map
// }
