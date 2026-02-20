// Helper to get account type from class
export function getAccountTypeFromClass(accountClass) {
    switch (accountClass) {
        case 1:
            return "EQUITY";
        case 2:
        case 3:
        case 5:
            return "ASSET";
        case 4:
            return "ASSET"; // Mixed - handled per account
        case 6:
            return "EXPENSE";
        case 7:
            return "REVENUE";
        case 8:
            return "ASSET"; // Special
        default:
            return accountClass;
    }
}
// Helper to check if account normally has debit balance
export function isDebitNormal(typeId) {
    return typeId === "ASSET" || typeId === "EXPENSE";
}
//# sourceMappingURL=models.js.map