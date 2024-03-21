use crate::detective::Request;
#[cfg(test)]
use protos::sp_steps_detective::DetectiveType;

#[test]
fn test_braintree_access_token() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_BRAINTREE_ACCESS_TOKEN,
                data: sample_json,
                path: "cloud.paypal.braintree_access_token".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal cloud.paypal.braintree_access_token".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_databricks_pat() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_DATABRICKS_PAT,
                data: sample_json,
                path: "cloud.databricks.pat".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal cloud.databricks.pat".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
pub fn test_sendgrid_key() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_SENDGRID_KEY,
                data: sample_json,
                path: "cloud.sendgrid.api_key".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal cloud.sendgrid.api_key".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
pub fn test_stripe_secret() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_STRIPE_SECRET,
                data: sample_json,
                path: "cloud.stripe.secret_key".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal cloud.stripe.secret_key".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
pub fn test_docker_swarm_token() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_DOCKER_SWARM_TOKEN,
                data: sample_json,
                path: "cloud.docker.swarm_join_token".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal cloud.docker.swarm_join_token".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_DOCKER_SWARM_TOKEN,
                data: sample_json,
                path: "cloud.docker.swarm_unlock_token".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal cloud.docker.swarm_unlock_token".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
pub fn test_bearer_token() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_BEARER_TOKEN,
                data: sample_json,
                path: "bearer_token".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal bearer_token".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
pub fn test_azure_sql_conn_string() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_AZURE_SQL_CONN_STRING,
                data: sample_json,
                path: "cloud.azure.sql_connection_string".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal cloud.azure.sql_connection_string".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}