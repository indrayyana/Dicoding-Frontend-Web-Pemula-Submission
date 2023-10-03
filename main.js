const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBookshelf(bookObject) {
  const bookTitle = document.createElement("h2");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = "Penulis: " + bookObject.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = "Tahun: " + bookObject.year;

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(bookTitle, bookAuthor, bookYear);

  const customDialog = document.getElementById("customDialog");
  const confirmDelete = document.getElementById("confirmDelete");
  const cancelDelete = document.getElementById("cancelDelete");

  cancelDelete.addEventListener("click", function () {
    customDialog.style.display = "none";
  });

  if (bookObject.isComplete) {
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");

    const unfinishedButton = document.createElement("button");
    unfinishedButton.innerText = "Belum selesai dibaca";
    unfinishedButton.setAttribute("id", `book-${bookObject.id}`);
    unfinishedButton.classList.add("green");

    unfinishedButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus buku";
    deleteButton.setAttribute("id", `book-${bookObject.id}`);
    deleteButton.classList.add("red");

    deleteButton.addEventListener("click", function () {
      customDialog.style.display = "block";

      confirmDelete.addEventListener("click", function () {
        removeBookFromCompleted(bookObject.id);
        customDialog.style.display = "none";
      });
    });

    buttonContainer.append(unfinishedButton, deleteButton);
    container.append(buttonContainer);
  } else {
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");

    const finishButton = document.createElement("button");
    finishButton.innerText = "Selesai dibaca";
    finishButton.setAttribute("id", `book-${bookObject.id}`);
    finishButton.classList.add("green");

    finishButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus buku";
    deleteButton.setAttribute("id", `book-${bookObject.id}`);
    deleteButton.classList.add("red");

    deleteButton.addEventListener("click", function () {
      customDialog.style.display = "block";

      confirmDelete.addEventListener("click", function () {
        removeBookFromCompleted(bookObject.id);
        customDialog.style.display = "none";
      });
    });

    buttonContainer.append(finishButton, deleteButton);
    container.append(buttonContainer);
  }

  return container;
}

function addBookshelf() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBook() {
  const searchBookTitle = document.getElementById("searchBookTitle").value;

  const searchResults = books.filter(function (bookItem) {
    return bookItem.title.toLowerCase().includes(searchBookTitle.toLowerCase());
  });

  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  const completeBookshelfList = document.getElementById("completeBookshelfList");

  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  if (searchBookTitle.trim() !== "") {
    for (const bookItem of searchResults) {
      const bookElement = makeBookshelf(bookItem);
      if (!bookItem.isComplete) {
        incompleteBookshelfList.append(bookElement);
      } else {
        completeBookshelfList.append(bookElement);
      }
    }
  } else {
    for (const bookItem of books) {
      const bookElement = makeBookshelf(bookItem);
      if (!bookItem.isComplete) {
        incompleteBookshelfList.append(bookElement);
      } else {
        completeBookshelfList.append(bookElement);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBookshelf();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log("Data berhasil disimpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  const completeBookshelfList = document.getElementById("completeBookshelfList");

  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBookshelf(bookItem);
    if (!bookItem.isComplete) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});
