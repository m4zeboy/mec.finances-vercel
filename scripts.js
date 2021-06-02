const Modal = {
    open(){
        // Abrir modal
        // Adcionar a class .active ao modal
        document.querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() {
        // fechar modal
        // remover a class .active do modal
        document.querySelector('.modal-overlay')
            .classList
            .remove('active')
        
        },
        
        toggleActive() {
            document   
            .querySelector('.modal-overlay')
            .classList
            .toggle('active')

            DOM.hideErrors()
        }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("mec.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("mec.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload()
    },
    incomes() {
        // Somar as entradas
        let income = 0;
        Transaction.all.forEach(transaction =>{
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },
    expense() {
        // Somar as saídas
        let expense = 0;
        Transaction.all.forEach(transaction =>{
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total() {
        // entradas - saídas
        return Transaction.incomes() + Transaction.expense()
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0? "-": "";

        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value;
    },
    formatAmount(value) {
        value = Number(value) * 100
        return Math.round(value)
    },
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const DOM = {
    transactionsContainer: document.querySelector('table#data-table tbody'),
    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense';

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img src="./assets/minus.svg" alt="Remover Transação" onclick="Transaction.remove(${index})" class="deleteTransaction">
            </td>
            `;
        return html;
    },
    updateBalance(){
        document
            .querySelector('#incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes()) 

        document
            .querySelector('#expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expense())
        document
            .querySelector('#totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransations() {
        DOM.transactionsContainer.innerHTML = "";
    },
    // erros
    span_error: document.querySelector('span#error'),
    displayErros(message) {
        this.span_error.classList.add('active')
        this.span_error.innerHTML = message;
    },
    hideErrors() {
        this.span_error.innerHTML = "";
        this.span_error.classList.remove('active')
    },
    // Success
    span_success: document.querySelector('#success'),
    displaySuccess(message) {   
        this.span_success.classList.add('active')
    },
    hideSuccess(){
        this.span_success.classList.remove('active')
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        let { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" ||date.trim() === "") {
            throw new Error("Por favor preencha todos os campos")
        }
    },
    formatValues() {
        let { date, description, amount, } = Form.getValues();

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },
    submit(event) {
        event.preventDefault()    

        try {
            // verificar se os campos foram preenchidos
            Form.validateFields()  
            // formatar os dados para salvar
            const transaction = Form.formatValues();
            // salvar
            Form.saveTransaction(transaction)
            //apagar os campos
            Form.clearFields()
            // fechar o modal
            Modal.close()
            //exibir mensagem de sucesso
            DOM.displaySuccess("Transação Salva")
            setTimeout(()=> {
                DOM.hideSuccess("Transação Salva")
            },3000)             
        } catch (error) {
            DOM.displayErros(error.message)
            // alert(error.message)
        }
        
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransations()
        App.init()
    }
}

App.init()
