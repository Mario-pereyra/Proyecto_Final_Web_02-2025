const PaymentAPI = {
    baseUrl: '/api/payments',

    async createPayment(projectId, amount, userId) {
        const response = await fetch(`${this.baseUrl}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, amount, userId })
        });
        return await response.json();
    }
};
