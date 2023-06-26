use protos::matcher::MatchType;
use snitch_detective::detective;
// use snitch_detective::protos;
// use snitch_detective::protos::matcher::MatchType;
// use snitch_detective::protos::matcher::MatchType::MATCH_TYPE_BOOLEAN_FALSE;

fn main() {
    let det = detective::Detective::new();

    // if let Ok(result) = det.matches(MatchType::MATCH_TYPE_BOOLEAN_TRUE, "1", vec!["2".to_string()], false) {
    if let Ok(result) = det.matches(MatchType::MATCH_TYPE_BOOLEAN_FALSE, "1", vec!["2".to_string()], false) {
        println!("Result: {}", result);
    } else {
        println!("Error!");
    }
}
