#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_gig_workflow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, GigContract);
    let client = GigContractClient::new(&env, &contract_id);

    let poster = Address::generate(&env);
    let worker = Address::generate(&env);

    let title = String::from_str(&env, "Bug Bounty: Fix Login");
    let description = String::from_str(&env, "Fix the authentication bug in the login flow.");
    let reward = 500;

    // 1. Post a gig
    let gig_id = client.post_gig(&title, &description, &reward, &poster);
    assert_eq!(gig_id, 1);

    // 2. Verify gig was posted
    let gigs = client.get_gigs();
    assert_eq!(gigs.len(), 1);
    let gig = gigs.get(0).unwrap();
    assert_eq!(gig.id, 1);
    assert_eq!(gig.title, title);
    assert_eq!(gig.reward, reward);
    assert_eq!(gig.poster, poster);
    assert_eq!(gig.status, 0); // 0 = Open

    // 3. Submit work
    let link = String::from_str(&env, "https://github.com/submission/1");
    client.submit_work(&gig_id, &worker, &link);

    let gigs = client.get_gigs();
    let gig = gigs.get(0).unwrap();
    assert_eq!(gig.submissions.len(), 1);
    let submission = gig.submissions.get(0).unwrap();
    assert_eq!(submission.worker, worker);
    assert_eq!(submission.link, link);

    // 4. Pick winner (Poster picks the worker and records payment)
    let payment_hash = String::from_str(&env, "stellar_tx_hash_123");
    client.pick_winner(&gig_id, &worker, &payment_hash);

    let gigs = client.get_gigs();
    let gig = gigs.get(0).unwrap();
    assert_eq!(gig.status, 1); // 1 = Closed/Completed
    assert_eq!(gig.worker, Some(worker));
    assert_eq!(gig.payment_hash, Some(payment_hash));
}

#[test]
fn test_multiple_submissions() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, GigContract);
    let client = GigContractClient::new(&env, &contract_id);

    let poster = Address::generate(&env);
    let worker1 = Address::generate(&env);
    let worker2 = Address::generate(&env);

    let title = String::from_str(&env, "Logo Design");
    let description = String::from_str(&env, "Need a modern logo for our startup.");
    let reward = 200;

    let gig_id = client.post_gig(&title, &description, &reward, &poster);

    client.submit_work(&gig_id, &worker1, &String::from_str(&env, "link1"));
    client.submit_work(&gig_id, &worker2, &String::from_str(&env, "link2"));

    let gigs = client.get_gigs();
    let gig = gigs.get(0).unwrap();
    assert_eq!(gig.submissions.len(), 2);
}
