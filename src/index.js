const catalog = document.querySelector(".main__catalog")
const favorites = document.querySelector(".main__favorites")

let usersList = null

// Функции запроса json данных
async function getUsers() {
    try {    
        const users = await fetch("https://json.medrating.org/users")
        const response = await users.json()
        
        return response
    } catch(e) {
        console.error(e)
    }
}

async function getAlbums(userId) {
    try {    
        const users = await fetch(`https://json.medrating.org/albums?userId=${userId}`)
        const response = await users.json()

        return response
    } catch(e) {
        console.error(e)
    }
}

async function getPhotos(albumId) {
    try {    
        const users = await fetch(`https://json.medrating.org/photos?albumId=${albumId}`)
        const response = await users.json()

        return response
    } catch(e) {
        console.error(e)
    }
}
//------------

// Загрузка данных в переменные
async function getData() {
    usersList = await getUsers()

    loadNames()
}
getData()

// Построение списка имён
function loadNames() {
    const usersListLength = usersList.length
    
    for (let i = 0; i < usersListLength; i++) { // можно и forEach по usersList
        const userDiv = document.createElement("div")
        const userBtn = document.createElement("button")

        userDiv.className = "main__user main__user__div"
        userBtn.className = "main__user main__user__btn"
        userBtn.innerText = `${usersList[i].name}`

        catalog.append(userDiv)
        userDiv.append(userBtn)
        
        userBtn.addEventListener("click", openUser(usersList[i].id, userDiv)) // декоратор нужен для уникальности showAlbums
    }
}

// Открытие пользователя и агрузка альбомов
function openUser(userId, userDiv) {
    let showAlbums = true // показывает открыт ли альбом

    async function fn(id, node) { 
        const userDiv = node
 
        showAlbums = !showAlbums
        if (showAlbums === true) {
            const albumsDivs = userDiv.querySelectorAll(".main__albums__div")
            const albumsLength = albumsDivs.length
            for (let i = 0; i < albumsLength; i++) {
                albumsDivs[i].remove()
            }

            return
        }

        const albums = await getAlbums(id) // получаем список альбомов по id               
        const albumsLength = albums.length 

        for (let i = 0; i < albumsLength; i++) {
            const albumsDiv = document.createElement("div")
            const albumsBtn = document.createElement("button")
            
            albumsDiv.className = "main__albums main__albums__div"
            albumsBtn.className = "main__albums main__albums__btn"
            albumsBtn.innerText = `${albums[i].title}`

            userDiv.append(albumsDiv)
            albumsDiv.append(albumsBtn)
            
            albumsBtn.addEventListener("click", openAlbum(albums[i].id, albumsDiv))
        }
    }

    return fn.bind(this, ...arguments)
}

// Открытие альбома и загрузка фото
function openAlbum(albumId, albumDiv) {
    let showPhotos = true    

    async function fn(id, node) {
        const albumDiv = node

        showPhotos = !showPhotos
        if (showPhotos === true) {
            const photosDivs = albumDiv.querySelectorAll(".main__photos__div")
            const photosLength = photosDivs.length
            for (let i = 0; i < photosLength; i++) {
                photosDivs[i].remove()
            }

            return
        }

        const photos = await getPhotos(id) // получаем список альбомов по id
        const photosLength = photos.length

        for (let i = 0; i < photosLength; i++) {
            const photosDiv = document.createElement("div")
            const photosFavorites = document.createElement("button")
            const photosImg = document.createElement("div")

            photosDiv.className = "main__photos main__photos__div"
            photosFavorites.className = "main__photos main__photos__favorites"
            photosImg.className = "main__photos main__photos__img"

            photosFavorites.innerHTML = "&#9733;"
            photosImg.setAttribute("title", photos[i].title)

            if (localStorage.getItem(`${photos[i].url}`)) { // делаем звёздочку активной если фото в избранном
                photosFavorites.classList.add("active")
            }

            albumDiv.append(photosDiv)
            photosDiv.append(photosFavorites)
            photosDiv.append(photosImg)

            photosFavorites.addEventListener("click", toggleFavorites.bind(this, photos[i].title, photos[i].url))
            photosImg.addEventListener("click", openImage.bind(this, photos[i].url))
        }
    }

    return fn.bind(this, ...arguments)
}

// Статус избранного
function toggleFavorites(photoTitle, photoUrl, event) {
        event.target.classList.toggle("active")
        
        if (localStorage.getItem(`${photoUrl}`) == null) {
            localStorage.setItem(photoUrl, photoTitle)
        } else {
            localStorage.removeItem(`${photoUrl}`)
        }
}

// Открытие изображения
function openImage(photoUrl) {
    const bgMadal = document.createElement("div")
    const madal = document.createElement("div")
    const btnCloseMadal = document.createElement("button")
    const image = document.createElement("img")

    bgMadal.className = "madal"
    madal.className = "madal__place"
    btnCloseMadal.className = "madal__btn"
    image.className = "madal__img"

    btnCloseMadal.innerHTML = "&times;"
    image.setAttribute("src", photoUrl)

    document.body.append(bgMadal)
    // bgMadal.append(madal)
    bgMadal.append(image)
    bgMadal.append(btnCloseMadal)

    btnCloseMadal.addEventListener("click", () => {
        bgMadal.remove()
    })
}

// Настройка навигации
(function handlerNav() {
    const catalogNav = document.querySelector(".header__link__catalog")
    const favoritesNav = document.querySelector(".header__link__favorites")
    const mainCatalog = document.querySelector(".main__catalog")
    const mainFavorites = document.querySelector(".main__favorites")

    catalogNav.addEventListener("click", (e) => {
        e.preventDefault()

        clearFavorite()

        mainCatalog.hidden = false
        mainFavorites.hidden = true
    })

    favoritesNav.addEventListener("click", (e) => {
        e.preventDefault()

        loadFavorite()

        mainCatalog.hidden = true
        mainFavorites.hidden = false
    })
})() // почему бы и нет :)

// Загрузка избранных фото
function loadFavorite() {
    const lsLength = localStorage.length
    if (!lsLength) {
        return
    }

    for (let i = 0; i < lsLength; i++) {
        const url = localStorage.key(i)
        const title = localStorage.getItem(url)

        const photoRow = document.createElement("div")
        const photoFavorites = document.createElement("button")
        const photoImg = document.createElement("div")
        const photoTitle = document.createElement("div")

        photoRow.className = "main__favorites favorites__row"
        photoFavorites.className = "main__favorites main__photos__favorites active"
        photoImg.className = "main__favorites main__photos__img"

        photoFavorites.innerHTML = "&#9733;"
        photoTitle.innerText = title
        
        favorites.append(photoRow)
        photoRow.append(photoFavorites)
        photoRow.append(photoImg)
        photoRow.append(photoTitle)
        
        photoFavorites.addEventListener("click", toggleFavorites.bind(this, title, url))
        photoImg.addEventListener("click", openImage.bind(this, url))
    }
}

function clearFavorite() {
    const favoritesList = favorites.children
    const listLength = favoritesList.length
    for (let i = 0; i < listLength; i++) {
        favoritesList[i].remove()
    }
}