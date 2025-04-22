const navLinks = document.querySelectorAll(".nav-link");
const infoContainers = document.querySelectorAll(".info-container");
const sortedBy = document.querySelectorAll("[data-category]");

const textJP = document.querySelectorAll(".text-jp");
const textEN = document.querySelectorAll(".text-en");

const Status = Object.freeze({
    Current: 0,
    Recent: 2,
    Favorited: 3,
    Bookmarked: 4,
    Completed: 5
});

class Library {
    constructor() {
        this.books = [];
    }

    addBook() {
        //form dialog popup--------------------------------------
        const dialog = document.querySelector(".form-dialog");
        const bookForm = document.querySelector(".book-form");

        //form buttons-------------------------------------------
        const addBtn = document.querySelector(".add-book");
        const closeBtn = document.querySelector(".close");    
    
        //event handling
        addBtn.addEventListener("click", () => dialog.showModal() );
    
        bookForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const form = new FormData(e.target);
            const newBook = new Book();
        
            for (const [key, value] of form) {
                newBook[key] = value;
                console.log(`key: ${key}, value: ${value}`);
            }
        
            this.books.push(newBook);
            dialog.close();
        });
    
        closeBtn.addEventListener("click", () => dialog.close() );
    }
    
    sortBy(type, order) {
        if (order == "ascending") return this.books.filter(book => book[type]);
        if (order == "descending") return this.books.filter(book => book[type]).reverse();
    }

    //convert the book objects into something that is to be displayed in the DOM
    mapBooks(bookArr, className) {
        const bookDivs = [];
        let tempArr = [];
        let arrLen = bookArr.length;

        if (arrLen == 0 && (className == "all-books" || className == "authors")) {
            arrLen = this.books.length;
            tempArr.push(...this.books);
        } else {
            tempArr.push(...bookArr);
        }

        for (let i = 0; i < arrLen; i++) {
            const book = document.createElement("div");
            book.classList.add("book");
            
            const ul = document.createElement("ul");
            ul.setAttribute("class", "info");

            const bookInfoNodes = Object.keys(tempArr[i]).map(key => {
                const keyCh = document.createElement("li");
                keyCh.setAttribute("class", key);

                if (key != "readStatus") {
                    keyCh.innerText = tempArr[i][key];
                }

                return keyCh;
            });

            if (className != "all-books") {
                book.classList.add(className);
            }

            const status = setStatusBoxOf(className);

            ul.append(...bookInfoNodes.slice(0, bookInfoNodes.length-1));
            book.append(status, ul);

            bookDivs.push(book);
        }

        return bookDivs;
    }
}

class Book {
    constructor(title, author, year, isbn) {
        this.title = title;
        this.author = author;
        this.year = year;
        this.isbn = isbn;
    
        this.readStatus = [Status.Recent];
    }

    setStatus(status) {
        this.readStatus.push(status);
    }

    removeStatus(status) {
        if (this.readStatus.includes(status)) {
            const idx = this.readStatus.indexOf(status);

            switch (idx) {
                case 0:
                    this.readStatus.shift();
                    break;
                case this.readStatus.length-1:
                    this.readStatus.pop();
                    break;
                default:
                    this.readStatus = this.readStatus.slice(0, idx) + this.readStatus.slice(idx+1);
            }
        }
    }
}

window.addEventListener("load", e => {
    infoContainers[1].classList.remove("hidden");
    navLinks[1].classList.add("link-select");
});

setLibrary();

/*
pressing each sidebar link displays the information from the library,
where books are categorized according to their read
*/
function setLibrary() {
    const library = new Library();

    navLinks.forEach((link, i) => {
        link.addEventListener("click", (e) => {
            //hides previous info-container divs
            enableHiddenOnPrevious(navLinks, infoContainers);
            infoContainers[i].classList.remove("hidden");

            const filterByStatus = books => {
                infoContainers[i].classList.add("books");

                return books.filter(book => {
                    return book.readStatus.includes(i);
                });
            };

            let filteredBooks = library.mapBooks(filterByStatus(library.books), sortedBy[i].dataset.category);

            if (filteredBooks.length > 0) {
                infoContainers[i].replaceChildren(...filteredBooks);
                infoContainers[i].classList.remove("info-container");

                const inputs = document.querySelectorAll(`input[type="checkbox"]`);
                console.log(inputs);

                const forms = document.querySelectorAll(".status");
                forms.forEach((form, num) => {
                    form.addEventListener("click", e => { 

                        e.target.toggleAttribute("checked");

                        Object.entries(Status).forEach(([statusName, status]) => {
                            if (capitalize(e.target.id) == statusName && e.target.hasAttribute("checked")) {
                                console.log(`Set book status [${statusName}]`);
                                library.books[num].setStatus(status);
                            }

                            if (capitalize(e.target.id) == statusName && !e.target.hasAttribute("checked")) {
                                console.log(`Removed book status [${statusName}]`);
                                library.books[num].removeStatus(status);
                            }
                        });

                        console.log(capitalize(e.target.id), e.target.hasAttribute("checked"));
                    });
                });
            }

            if (filteredBooks.length == 0) {
                infoContainers[i].classList.remove("books");
                infoContainers[i].append(textJP[i], textEN[i]);
            }

            e.currentTarget.classList.add("link-select");
        });
    });
    
    library.addBook();
}

function setStatusBoxOf(className) {
    const statuses = document.createElement("form");
    statuses.setAttribute("class", "status");

    Object.values(Status).filter(status => {
        return status != Status.Recent;
    }).forEach((status) => {
        const inputContainer = document.createElement("div");

        const label = document.createElement("label");
        const input = document.createElement("input");

        input.type = "checkbox";

        switch (status) {
            case Status.Current:
                label.htmlFor = "current";
                label.innerText = "Reading";
                input.id = "current";

                break;
            case Status.Favorited:
                label.htmlFor = "favorited";
                label.innerText = "Add to Favorites";
                input.id = "favorited";

                break;
            case Status.Bookmarked:
                label.htmlFor = "bookmarked";
                label.innerText = "Add to Bookmarks";
                input.id = "bookmarked";

                break;
            case Status.Completed:
                label.htmlFor = "completed";
                label.innerText = "Completed";
                input.id = "completed";

                break;
        }

        if (input.id == className) {
            input.checked = true;
            input.setAttribute("checked", "");
        }

        inputContainer.append(label, input);
        statuses.append(inputContainer);
    })

    return statuses;
}

function enableHiddenOnPrevious(navLinks, infoContainers) {
    infoContainers.forEach((container, i) => {
        if (!container.classList.contains("hidden")) {
            container.classList.add("info-container");
            container.classList.add("hidden");

            container.classList.remove("books");
            navLinks[i].classList.remove("link-select");
        }
    });
}

function capitalize(word) {
    return word.replace(word[0], word[0].toUpperCase());
}