const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const formatCurrency = (amount) =>
    inrFormatter.format(Number(amount));

export default formatCurrency;
