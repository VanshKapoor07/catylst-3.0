module investment_contract::investment_v1 {
    use std::signer;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_TARGET_NOT_REACHED: u64 = 4;
    const E_NOT_AUTHORIZED: u64 = 5;

    /// Struct to hold the investment data
    struct InvestmentData has key {
        startup_address: address,
        target_amount: u64,
        total_investment: u64,
        is_active: bool,
    }

    /// Struct to hold individual investments
    struct Investment has key {
        amount: u64,
    }

    /// Initialize the investment contract
    public entry fun initialize(startup: &signer, target_amount: u64) {
        let startup_address = signer::address_of(startup);
        assert!(!exists<InvestmentData>(startup_address), E_ALREADY_INITIALIZED);

        move_to(startup, InvestmentData {
            startup_address,
            target_amount,
            total_investment: 0,
            is_active: true,
        });
    }

    /// Invest in the startup
    public entry fun invest(investor: &signer, startup_address: address, amount: u64) acquires InvestmentData, Investment {
        assert!(exists<InvestmentData>(startup_address), E_NOT_INITIALIZED);
        
        let investment_data = borrow_global_mut<InvestmentData>(startup_address);
        assert!(investment_data.is_active, E_TARGET_NOT_REACHED);

        let investor_address = signer::address_of(investor);
        
        // Update or create investment record
        if (!exists<Investment>(investor_address)) {
            move_to(investor, Investment { amount: 0 });
        };
        let investment = borrow_global_mut<Investment>(investor_address);
        investment.amount = investment.amount + amount;

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
        assert!(exists<InvestmentData>(startup_address), E_NOT_INITIALIZED);

        let investment_data = borrow_global<InvestmentData>(startup_address);
        assert!(!investment_data.is_active, E_TARGET_NOT_REACHED);
        assert!(startup_address == investment_data.startup_address, E_NOT_AUTHORIZED);

        // In a real implementation, you would transfer the funds here
        // For simplicity, we're just marking the contract as inactive
        let investment_data = borrow_global_mut<InvestmentData>(startup_address);
        investment_data.is_active = false;
    }

    /// Check if the investment has been initialized for a given address
    #[view]
    public fun is_initialized(address: address): bool {
        exists<InvestmentData>(address)
    }

    /// Get the investment data for a given address
    #[view]
    public fun get_investment_data(startup_address: address): (u64, u64, bool) acquires InvestmentData {
        assert!(exists<InvestmentData>(startup_address), E_NOT_INITIALIZED);
        let investment_data = borrow_global<InvestmentData>(startup_address);
        (investment_data.target_amount, investment_data.total_investment, investment_data.is_active)
    }

    /// Get an investor's investment amount
    #[view]
    public fun get_investor_investment(investor_address: address): u64 acquires Investment {
        if (!exists<Investment>(investor_address)) {
            return 0
        };
        borrow_global<Investment>(investor_address).amount
    }
}