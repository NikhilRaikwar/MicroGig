#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, String, Vec, Address, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct Submission {
    pub worker: Address,
    pub link: String,
}

#[contracttype]
#[derive(Clone)]
pub struct Gig {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub reward: u64,
    pub poster: Address,
    pub worker: Option<Address>,
    pub status: u32, // 0: Open, 1: Paid/Closed
    pub submissions: Vec<Submission>,
    pub payment_hash: Option<String>, // New field for receipt
}

#[contracttype]
pub enum DataKey {
    Gigs,
    Counter,
}

#[contract]
pub struct GigContract;

#[contractimpl]
impl GigContract {
    // Post a new Gig
    pub fn post_gig(env: Env, title: String, desc: String, reward: u64, poster: Address) -> u64 {
        poster.require_auth();

        let mut count: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        count += 1;

        let new_gig = Gig {
            id: count,
            title,
            description: desc,
            reward,
            poster,
            worker: None,
            status: 0,
            submissions: Vec::new(&env),
            payment_hash: None,
        };

        let mut gigs: Vec<Gig> = env.storage().instance().get(&DataKey::Gigs).unwrap_or(Vec::new(&env));
        gigs.push_back(new_gig);
        
        env.storage().instance().set(&DataKey::Gigs, &gigs);
        env.storage().instance().set(&DataKey::Counter, &count);

        count
    }

    // Submit Work
    pub fn submit_work(env: Env, gig_id: u64, worker: Address, link: String) {
        worker.require_auth();

        let mut gigs: Vec<Gig> = env.storage().instance().get(&DataKey::Gigs).unwrap_or(Vec::new(&env));
        let mut found_index = None;
        let mut updated_gig = None;

        for i in 0..gigs.len() {
            let gig = gigs.get(i).unwrap();
            if gig.id == gig_id {
                if gig.status != 0 {
                    panic!("Gig is closed");
                }
                let mut g = gig.clone();
                let submission = Submission {
                    worker: worker.clone(),
                    link,
                };
                g.submissions.push_back(submission);
                updated_gig = Some(g);
                found_index = Some(i);
                break;
            }
        }

        if let Some(idx) = found_index {
            gigs.set(idx, updated_gig.unwrap());
            env.storage().instance().set(&DataKey::Gigs, &gigs);
        }
    }

    // Pick Winner & Record Payment
    pub fn pick_winner(env: Env, gig_id: u64, winner: Address, payment_hash: String) {
        let mut gigs: Vec<Gig> = env.storage().instance().get(&DataKey::Gigs).unwrap_or(Vec::new(&env));
        let mut found_index = None;
        let mut updated_gig = None;

        for i in 0..gigs.len() {
            let gig = gigs.get(i).unwrap();
            if gig.id == gig_id {
                gig.poster.require_auth(); 

                let mut g = gig.clone();
                g.worker = Some(winner.clone());
                g.status = 1; // Closed
                g.payment_hash = Some(payment_hash); // Store proof!
                
                updated_gig = Some(g);
                found_index = Some(i);
                break;
            }
        }

        if let Some(idx) = found_index {
            gigs.set(idx, updated_gig.unwrap());
            env.storage().instance().set(&DataKey::Gigs, &gigs);
        }
    }

    pub fn get_gigs(env: Env) -> Vec<Gig> {
        env.storage().instance().get(&DataKey::Gigs).unwrap_or(Vec::new(&env))
    }
}
