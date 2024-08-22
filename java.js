console.log("welcome to spotify clone")
let currentsong = new Audio();
let songs;
let currfolder;
function convertSecondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00.00";
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);
    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }
    return `${minutes}:${remainingSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
// show all the songs in the playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
        <img class="invert" src="music.svg" alt="">
        <div class="songinfo">
            <div>${song.replaceAll("%20", " ")} </div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
        </div>
        </li>`;
    }
    // attaching event listener for each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        playbtn.src = "pause.svg"
    }
    document.querySelector(".info").innerHTML = decodeURI(track);
    document.querySelector(".time").innerHTML = "00.00/00.00"
}

async function displayalbums() {
    let a = await fetch(`songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a")
    let cardcontainer=document.querySelector(".cardscontainer")
    let array=Array.from(anchor)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if (e.href.includes("songs/")) {
            let folder = e.href.split("songs/").slice(-2)[1]
            // set the metadata of folder
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="cards">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.descriptionn}</p>
                    </div>`
        }

    }
    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })
}

async function main() {
    // getting list of all songs
    await getsongs("songs/")
    playmusic(songs[0], true)

    // display all the albums on the page
    await displayalbums()


    playbtn.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            playbtn.src = "pause.svg"
        }
        else {
            currentsong.pause()
            playbtn.src = "play.svg"
        }
    })

    // listen for time update
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".time").innerHTML = `${convertSecondsToMinutesAndSeconds(currentsong.currentTime)}/${convertSecondsToMinutesAndSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
        //document.querySelector(".circle").style.left
    })
    //  adding an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    })
    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    // add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })
    // add an event listener for prev
    document.querySelector(".prev").addEventListener("click", () => {
        console.log("prev clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if (index - 1 >= 0)
            playmusic(songs[index - 1]);
    })
    // add an event listener for next
    document.querySelector(".next").addEventListener("click", () => {
        currentsong.pause()
        console.log("next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length)
            playmusic(songs[index + 1]);
    })
    // load the playlist whenever card is clicked
    
}
main()