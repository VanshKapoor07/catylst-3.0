address 0x51e1de64d24251bbd3d9d96914e9cb8e79e08b3396c66c974d4b6087c0273916 {
    module investment_contract_finallyy {  // Updated to v2
        use std::signer;
        use aptos_framework::table::{Self, Table};
        use std::vector;

        /// Error codes
        const E_NOT_INITIALIZED: u64 = 1;
        const E_ALREADY_INITIALIZED: u64 = 2;
        const E_INSUFFICIENT_BALANCE: u64 = 3;
        const E_TARGET_NOT_REACHED: u64 = 4;
        const E_NOT_AUTHORIZED: u64 = 5;

        /// Struct to hold the investment data
        struct InvestmentData has key {
            version: u64,
            startup_address: address,
            target_amount: u64,
            total_investment: u64,
            is_active: bool,
            investments: Table<address, u64>,
            investors: vector<address>,  // List to store investor addresses
        }

        /// Initialize the investment contract
        public entry fun initialize(startup: &signer, target_amount: u64) {
            let startup_address = signer::address_of(startup);
            assert!(!exists<InvestmentData>(startup_address), E_ALREADY_INITIALIZED);

            move_to(startup, InvestmentData {
                version: 1,
                startup_address,
                target_amount,
                total_investment: 0,
                is_active: true,
                investments: table::new(),
                investors: vector::empty(),  // Initialize an empty list of investors
            });
        }

        /// Invest in the startup    (performTransaction function in catalyst2.0, invest here)
        public entry fun invest(startup_address: address, investor: &signer, amount: u64) acquires InvestmentData {
            let investor_address = signer::address_of(investor);
            assert!(exists<InvestmentData>(startup_address), E_NOT_INITIALIZED);
            
            let investment_data = borrow_global_mut<InvestmentData>(startup_address);
            assert!(investment_data.is_active, E_TARGET_NOT_REACHED);
            
            // Update or create investment record
            if (!table::contains(&investment_data.investments, investor_address)) {
                table::add(&mut investment_data.investments, investor_address, amount);
                vector::push_back(&mut investment_data.investors, investor_address);  // Add new investor to the list
            } else {
                let investor_amount = table::borrow_mut(&mut investment_data.investments, investor_address);
                *investor_amount = *investor_amount + amount;
            };

            // Update total investment
            investment_data.total_investment = investment_data.total_investment + amount;

            // Check if target is reached
            if (investment_data.total_investment >= investment_data.target_amount) {
                investment_data.is_active = false;
            };
        }

        /// Withdraw funds (only callable by startup)
        public entry fun withdraw(startup: &signer) acquires InvestmentData {
            let startup_address = signer::address_of(startup);
            //assert!(exists<InvestmentData>(startup_address), E_NOT_INITIALIZED);

            let investment_data = borrow_global<InvestmentData>(startup_address);
            //assert!(!investment_data.is_active, E_TARGET_NOT_REACHED);
            //assert!(startup_address == investment_data.startup_address, E_NOT_AUTHORIZED);

            // In a real implementation, you would transfer the funds here
            // For simplicity, we're just marking the contract as inactive
            let investment_data = borrow_global_mut<InvestmentData>(startup_address);
            investment_data.is_active = false;
            investment_data.total_investment = 0;
        }

        #[view]
        public fun is_initialized(address: address): bool {
            exists<InvestmentData>(address)
        }

        public entry fun reset(startup: &signer, new_target_amount: u64) acquires InvestmentData {
            let startup_address = signer::address_of(startup);
            assert!(exists<InvestmentData>(startup_address), E_NOT_INITIALIZED);

            let investment_data = borrow_global_mut<InvestmentData>(startup_address);
            assert!(startup_address == investment_data.startup_address, E_NOT_AUTHORIZED);

            // Reset the contract
            investment_data.target_amount = new_target_amount;
            investment_data.total_investment = 0;
            investment_data.is_active = true;
            
            // Clear the investments table and reset the investor list
            clear_investments(&mut investment_data.investments, &mut investment_data.investors);
        }
        
        #[view]
        public fun get_investment_data(startup_address: address): (u64, u64, bool) acquires InvestmentData {
            assert!(exists<InvestmentData>(startup_address), E_NOT_INITIALIZED);
            let investment_data = borrow_global<InvestmentData>(startup_address);
            (investment_data.target_amount, investment_data.total_investment, investment_data.is_active)
        }

        #[view]
        public fun get_investor_investment(startup_address: address, investor_address: address): u64 acquires InvestmentData {
            assert!(exists<InvestmentData>(startup_address), E_NOT_INITIALIZED);
            let investment_data = borrow_global<InvestmentData>(startup_address);
            if (table::contains(&investment_data.investments, investor_address)) {
                *table::borrow(&investment_data.investments, investor_address)
            } else {
                0
            }
        }

        /// Helper function to clear investments
        fun clear_investments(investments: &mut Table<address, u64>, investors: &mut vector<address>) {
            let num_investors = vector::length(investors);
            let i = 0;
            while (i < num_investors) {
                let investor = vector::borrow(investors, i);
                table::remove(investments, *investor);
                i = i + 1;
            };
            *investors = vector::empty();  // Reset the investors vector
        }
    }
}
