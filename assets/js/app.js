Array.prototype.swap = function (x,y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
}

import songs from './songs.js'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const main = $('.main')
const playingSong = $('.playing-song h3')
const cd = $('.cd')
const cdThumb = $('.cd-thumb')
const cdThumbShadow = $('.cd-thumb--shadow')
const audio = $('#audio')
const progress = $('#progress')
const playBtn = $('.btn.btn-main')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    isPlaying: false,
    _this: this,
    // Chuẩn bị cho việc quay CD
    rotateCD: [
        { transform: 'rotate(360deg)' }
    ],
    duration: {
        duration: 30000,
        iterations: Infinity
    },
    cdRoateAnmation: [],

    // Load danh sách bài hát qua API
    getList: function (callback) {
        // let api = "https://my-json-server.typicode.com/htrvu/Simple-music-player/songs"
        // // let api = " http://localhost:3000/songs"
        
        // fetch(api)
        //     .then((response) => response.json())
        //     .then((songs) => {
        //         callback(songs)
        //     })

        // Làm tạm tại local :))
        callback(songs)
    },

    handleEvent: function() {
        const events = {            
            // Xoay CD khi phát
            cdRotate: function() {
                audio.onplay = function() {
                    app.cdRoateAnmation[0].play()
                    app.cdRoateAnmation[1].play()
                }
                audio.onpause = function() {
                    app.cdRoateAnmation[0].pause()
                    app.cdRoateAnmation[1].pause()
                }
            },

            // Phóng to, thu nhỏ CD khi scroll
            scroll: function() {
                let cdWith = cd.offsetWidth
                // Xử lý khi scroll (đĩa CD thu nhỏ rồi mất)
                // Nếu dùng scroll với cả document, phải đề phòng trường hợp k hỗ trợ:
                //      Dùng (document.scrollY || document.documentElement.scrollTop)
                main.onscroll = function() {
                    let newWidth = cdWith - main.scrollTop
                    if (newWidth < 0) newWidth = 0
                    cd.style.width = newWidth + 'px'
                    cd.style.opacity = newWidth / cdWith
                }
            },

            // Phát / Dừng bài hát
            playSong: function() {
                playBtn.onclick = function() {
                    if (app.isPlaying) {
                        audio.pause()
                    }
                    else {
                        audio.play()
                    }
                    app.isPlaying = !app.isPlaying
                    playBtn.classList.toggle('btn--play')
                }
            },

            // Cập nhật thanh thời lượng
            updateTime: function() {
                audio.ontimeupdate = function() {
                    // Nếu bài hát vẫn chưa hết
                    if (audio.duration) {
                        let percent = audio.currentTime * 100 / audio.duration
                        progress.value = percent
                    }
                }
            },

            // Tua nhạc
            skipTime: function() {
                progress.oninput = function() {
                    audio.currentTime = audio.duration * progress.value / 100
                }
            },

            execute() {
                this.cdRotate()
                this.scroll()
                this.playSong()
                this.updateTime()
                this.skipTime()
            }
        }
        
        events.execute()

        return events
    },

    handleSongList: function(songs) {
        const actions = {
            initialSongs: [...songs],
            indexOfCurrentSong: 0,
            listSongs: [],

            renderList: function() {
                let htmls = ''
                for (let song of songs) {
                    htmls += `
                        <a href=${song.link} class="song">
                            <div class="song-img" style="background-image: url(${song.image})"></div>
                            <div class="song-info">
                                <h3 class="song-name">${song.name}</h3>
                                <span class="song-single">${song.single}</span>
                            </div>
                            <div class="song-option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </a>
                    `
                }
                playlist.innerHTML = htmls
                actions.listSongs = [...$$('.song')]
            },

            scrollToSong: function(id) {
                actions.listSongs[id].scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                    inline: "nearest"
                });
            },

            // Đánh dấu bài hát được phát trong list (thêm class)
            markSongToPlay: function(id) {
                actions.listSongs[actions.indexOfCurrentSong].classList.remove('song--playing')
                actions.indexOfCurrentSong = id
                actions.listSongs[id].classList.toggle('song--playing')
            },

            // Load songs[id] lên dashboard
            loadSongToDashBoard: function(id, callback) {
                // Đánh dấu bài hát chuẩn bị được phát
                actions.markSongToPlay(id)
            
                // Scroll đến bài hát vừa load
                actions.scrollToSong(id)

                // Cập nhật nội dung thẻ HTML
                playingSong.textContent = songs[id].name
                cdThumb.style["background-image"] = `url(${songs[id].image})`
                cdThumbShadow.style["background-image"] = `url(${songs[id].image})`
                audio.src = `${songs[id].link}`
                
                // Hủy animation quay CD hiện tại
                if (app.cdRoateAnmation.length > 0 && app.cdRoateAnmation[0].cancel) {
                    app.cdRoateAnmation[0].cancel()
                    app.cdRoateAnmation[1].cancel()
                }
                // Refresh animation quay CD
                app.cdRoateAnmation = [
                    cdThumb.animate(app.rotateCD, app.duration),
                    cdThumbShadow.animate(app.rotateCD, app.duration),
                ]
                app.cdRoateAnmation[0].pause()
                app.cdRoateAnmation[1].pause()
                
                if (callback) callback()
            },

            // Tự động phát khi chuyển bài
            playSong: function() {
                audio.play()
                app.isPlaying = true
                if (!playBtn.classList.contains('btn--play')) {
                    playBtn.classList.add('btn--play')
                }
            },

            // Next song
            nextSong: function() {
                nextBtn.onclick = function() {
                    let id = actions.indexOfCurrentSong
                    id++
                    if (id == songs.length) id = 0
                    actions.loadSongToDashBoard(id, actions.playSong)
                }
            },

            // Previous song
            prevSong: function() {
                prevBtn.onclick = function() {
                    let id = actions.indexOfCurrentSong
                    id--
                    if (id < 0) id = songs.length - 1
                    actions.loadSongToDashBoard(id, actions.playSong)
                }
            },

            // Chọn 1 bài bất kì
            chooseSong: function() {
                // Không nên lắng nghe event từng phần tử (vì trong tương lai có thể
                // add thêm)
                playlist.onclick = function(e) {
                    e.preventDefault()
                    // Nếu click vào bài hát
                    if (!e.target.closest('.song-option')) {
                        let parent = e.target.closest('.song')
                        if (parent) {
                            actions.loadSongToDashBoard(actions.listSongs.indexOf(parent), actions.playSong)
                        }
                    }
                }
            },

            // Phát ngẫu nhiên
            randomSong: function() {
                randomBtn.onclick = function() {
                    randomBtn.classList.toggle('btn--active')
                    if (randomBtn.classList.contains('btn--active')) {
                        // Shuffle mảng songs
                        function randomAtIndex(array, index) {
                            let j = Math.floor(Math.random() * (index + 1))
                            songs.swap(j, index)
                        }

                        songs.swap(actions.indexOfCurrentSong, songs.length - 1)

                        let direction = Math.random()
                        if (direction >= 0.5) {
                            for (let i = songs.length - 2; i >= 0; i--) {
                                randomAtIndex(songs, i)
                            }
                        }
                        else {
                            for (let i = 0; i < songs.length - 1; i++) {
                                randomAtIndex(songs, i)
                            }
                        }

                        songs.swap(songs.length - 1, 0)
                        actions.indexOfCurrentSong = 0
                    }
                    else {
                        // Render lại danh sách ban đầu (từ database)
                        let temp = songs[actions.indexOfCurrentSong]
                        songs = [...actions.initialSongs]
                        actions.indexOfCurrentSong = songs.indexOf(temp)
                    }                    
                    
                    actions.scrollToSong(actions.indexOfCurrentSong)
                    actions.renderList(songs)
                    actions.markSongToPlay(actions.indexOfCurrentSong)
                }
            },

            // Lặp lại bài hát
            repeatSong: function() {
                repeatBtn.onclick = function() {
                    repeatBtn.classList.toggle('btn--active')
                }
            },
            
            // Xử lý khi hết bài
            endSong: function() {
                audio.onended = function() {
                    progress.value = 0
                    if (repeatBtn.classList.contains('btn--active')) {
                        audio.play()
                    }
                    else nextBtn.click()
                }
            },

            execute: function() {
                this.renderList()
                this.loadSongToDashBoard(0)
                this.chooseSong()
                this.nextSong()
                this.prevSong()
                this.randomSong()
                this.repeatSong()
                this.endSong()
            }
        }

        actions.execute()
    },

    start: function() {
        this.getList(this.handleSongList)
        this.handleEvent()
    }
}

app.start()

    