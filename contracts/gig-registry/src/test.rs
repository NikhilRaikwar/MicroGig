#![cfg(test)]

use super::*;
use soroban_sdk::{Env, Address, testutils::Address as _};

#[test]
fn test_gig_flow() {
    let env = Env::default();
    let contract_id = env.register_contract(None, GigContract);
    let client = GigContractClient::new(&env, &contract_id);

    // 1. Create Poster & Worker
    let poster = Address::generate(&env);
    let worker = Address::generate(&env);

    // 2. Post Gig
    let gig_id = client.post_gig(
        &"Fix Bug".into_val(&env), 
        &"Fix a CSS bug".into_val(&env), 
        &10, 
        &poster
    );
    assert_eq!(gig_id, 1);

    // 3. Verify Gig Created
    let gigs = client.get_gigs();
    assert_eq!(gigs.len(), 1);
    let gig = gigs.get(0).unwrap();
    assert_eq!(gig.title, "Fix Bug".into_val(&env));

    // 4. Submit Work
    client.submit_work(&gig_id, &worker, &"https://github.com/pr".into_val(&env));

    // 5. Verify Submission
    let updated_gigs = client.get_gigs();
    let updated_gig = updated_gigs.get(0).unwrap();
    assert_eq!(updated_gig.submissions.len(), 1);

    // 6. Pick Winner
    client.pick_winner(&gig_id, &worker, &"tx_hash_123".into_val(&env));

    // 7. Verify Closed & Winner
    let closed_gigs = client.get_gigs();
    let final_gig = closed_gigs.get(0).unwrap();
    assert_eq!(final_gig.status, 1);
    assert_eq!(final_gig.worker, Some(worker));
}
