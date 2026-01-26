# 💸 Expensify - Personal Finance Dashboard

**Expensify** is a lightweight, privacy-focused personal finance tracker that helps users manage their income and expenses with zero latency. Built entirely with vanilla JavaScript, it runs directly in the browser and persists data locally, ensuring user privacy without the need for a backend server.

![Project Banner](https://via.placeholder.com/1000x400?text=Expensify+Dashboard+Screenshot)
*(Replace this link with a screenshot of your actual dashboard)*

## 🚀 Key Features

* **Real-Time Tracking:** Instantly calculates Net Balance, Total Income, and Total Expenses.
* **Smart Analytics:**
    * **Daily Average:** Calculates spending based on the exact number of days passed in the current month.
    * **Financial Health Score:** Gamified metric (0-100) based on your savings rate.
* **Full Control (CRUD):**
    * **Add** transactions with automatic date sorting.
    * **Edit** existing transactions (update amounts, descriptions, or categories).
    * **Delete** unwanted entries.
* **Customization:** Create **Custom Categories** on the fly to suit your specific lifestyle needs.
* **Data Persistence:** Uses the browser's **LocalStorage API** to save data. Your financial records survive page refreshes and browser restarts.
* **Visualizations:** Interactive charts powered by **Chart.js** (Doughnut charts for expense breakdown and health score).
* **Privacy First:** No data is sent to external servers. Everything stays on your device.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (CSS Variables, Flexbox, Grid)
* **Logic:** Vanilla JavaScript (ES6+, Object-Oriented structure)
* **Libraries:**
    * [Chart.js](https://www.chartjs.org/) (Data Visualization)
    * [FontAwesome](https://fontawesome.com/) (Icons)
    * [Google Fonts](https://fonts.google.com/) (Inter & Poppins typography)

## 📂 Project Structure

```text
/Expensify-Project
│
├── index.html      # Main HTML structure and external CDN links
├── style.css       # Custom styling, responsive design, and animations
├── script.js       # Core application logic, DOM manipulation, and Math
└── README.md       # Project documentation