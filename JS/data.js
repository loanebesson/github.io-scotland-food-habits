// Data: Defra, Living Costs and Food Survey (Family Food), Scotland.
// Unit: pence per person per week, current prices.
const YEARS = ["2001-02", "2002-03", "2003-04", "2004-05", "2005-06", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2015-16", "2016-17", "2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25"];
 
const PRODUCTS = {
  fruit: { colorDark: "#8fb0e8", title: "Fresh fruit: spending has doubled", label: "Fresh fruit", color: "#1F3864", note: null,
    values: [93.3, 99.9, 99.8, 115.6, 118.9, 121.4, 138.9, 146.0, 140.5, 147.7, 132.9, 150.1, 139.9, 148.2, 145.9, 152.4, 187.6, 175.0, 177.3, 176.1, 191.0, 168.6, 185.6, 189.3, 197.0] },
  drinks: { colorDark: "#4fc3c3", title: "Low-calorie soft drinks: spending up almost threefold", label: "Low-calorie soft drinks", color: "#2E8B8B", note: null,
    values: [29.1, 29.2, 33.1, 25.2, 26.6, 35.8, 30.9, 29.3, 31.0, 34.9, 36.0, 54.2, 53.2, 43.0, 51.4, 50.5, 59.6, 55.3, 57.6, 69.9, 61.4, 85.4, 81.1, 73.9, 82.2] },
  pizza: { colorDark: "#f0a070", title: "Pizzas (frozen, fresh, takeaway): rising, but very erratic", label: "Pizzas", color: "#E07B39", note: null,
    values: [45.1, 41.7, 44.3, 40.0, 51.1, 51.1, 52.8, 55.5, 57.0, 63.2, 75.8, 68.8, 75.1, 52.4, 73.0, 74.8, 81.2, 81.2, 87.1, 70.4, 92.3, 72.0, 78.3, 56.3, 76.2] },
  milk: { colorDark: "#8fc46a", title: "Plant-based milks and other milk substitutes: a sharp rise", label: "Plant-based milks", color: "#5B8C3A", note: "Low-reliability data: read it as a trend, not as exact values. No data before 2004-05.",
    values: [null, null, null, 1.5, 2.1, 1.6, 1.2, 1.8, 1.8, 2.2, 0.8, 2.0, 2.5, 3.5, 3.9, 5.2, 6.8, 6.6, 6.2, 8.6, 9.2, 13.9, 17.3, 22.0, 14.5] },
};