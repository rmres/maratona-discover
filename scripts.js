const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transactions = {
    all: Storage.get(),
    add(transaction) {
        Transactions.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transactions.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0
        Transactions.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },
    expenses() {
        let expense = 0
        Transactions.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },
    total() {
        return this.incomes() + this.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${Utils.formatCurrency(transaction.amount)}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>`

        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transactions.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transactions.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transactions.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatDate(date) {
        const splitDate = date.split("-")
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },
    validateFields() {
        const { description, amount, date } = this.getValues()

        if (description.trim() == "" || amount.trim() == "" || date.trim() == "") {
            throw new Error("Preencha todos os campos.")
        }
    },
    formatData() {
        let { description, amount, date } = this.getValues()
        amount = amount * 100
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const newTransaction = Form.formatData()
            Transactions.add(newTransaction)
            this.clearFields()
            Modal.close()
        }
        catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transactions.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transactions.all)
    },
    reload() {
        DOM.clearTransactions()
        this.init()
    }
}

App.init()