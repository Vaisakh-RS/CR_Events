const main = async() => {
    const query = `
    query MyQuery {
        eventsCr(first: 500) {
            id
            venue
            registerLink
            rulesAndRegulations
            registerFee
            eventName
            eventDay
            eventDescriptions {
                text
            }
            date
            image {
                url
            }
        }
    }
`

    const res = await fetch('https://api-ap-south-1.graphcms.com/v2/cl4ivz33z4hql01z6ew8092vt/master', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'applciation/json'
        },
        body: JSON.stringify({
            query
        })
    });

    const data = await res.json()
    const eventsList = data.data.eventsCr

    let dummyEvents = [
        [],
        [],
        []
    ]

    for (const e of eventsList) {
        const ed = Number(e.eventDay[e.eventDay.length - 1])

        e.eventDescriptions.text = e.eventDescriptions.text.replaceAll('\\n', '<br /> <br />')

        dummyEvents[ed - 1].push(e)
    }

    const dayText = document.querySelector('#day-grid-number')

    const dayPrev = () => {
        if (day == 1) {
            return;
        }

        nextButton.disabled = false
        day--;

        moveDay(prevButton);
    }

    const dayNext = () => {
        if (day == 2) {
            return;
        }

        prevButton.disabled = false
        day++;

        moveDay(nextButton);
    }

    let left = 0

    const build = (button) => {
        let ix = 0
        for (const event of events) {
            eventsSlide.innerHTML += `
                <div class="slide__item" data-id="${ix}">
                    <div class="slide__item-inner">
                        <div class="slide__item-details">
                            <h1>${event.eventName}</h1>
                            <a href="${event.rulesAndRegulations}">rules and regulations</a>
                            <p>${event.eventDescriptions.text}</p>
                            <a class="register-button" href="${event.registerLink}" target="_blank">
                                <button>Register</button>
                            </a>
                        </div>
                        <img src="${event.image.url}" />
                    </div>
                    <div class="slide__item-content">
                        <h1 class="slide__item-title">${event.eventName}</h1>
                    </div>
                </div> 
            `
        }

        let i = 0
        for (const node of eventsSlide.children) {
            node.style.transition = `transform 300ms ${i * 200}ms, opacity 300ms ${i * 200}ms`
            i++
        }

        setTimeout(() => {
            for (const node of eventsSlide.children) {
                node.classList.add('slide-event-in')
            }

            if (button) {
                button.disabled = false

                if (day == 2) {
                    nextButton.disabled = true
                }

                if (day == 1) {
                    prevButton.disabled = true
                }
            }
        }, 100)

        left = 0
    }

    const moveDay = (button) => {
        let i = 0
        for (const node of eventsSlide.children) {
            node.style.transition = `transform 300ms ${i * 200}ms, opacity 300ms ${i * 200}ms`
            node.classList.add('slide-event-out')
            i++
        }

        dayText.innerHTML = String(day)

        events = get()
        button.disabled = true

        setTimeout(() => {
            eventsSlide.innerHTML = ''
            build(button)
        }, 300 + 200 * Math.min(4, eventsSlide.children.length))
    }

    const get = () => {
        return dummyEvents[day - 1]
    }

    let day = 1
    let events = get()

    const eventsSlide = document.querySelector('#events__slide')
    const eventsSlideContainer = document.querySelector('#events__slide-container')

    const prevButton = document.querySelector('#day-grid-button1')
    prevButton.addEventListener('click', dayPrev)
    prevButton.disabled = true

    const nextButton = document.querySelector('#day-grid-button2')
    nextButton.addEventListener('click', dayNext)

    let auto = 75
    let vel = auto
    let fac = 175
    let decel = 2000
    let initialLeft = left

    build(null)

    let dragging = false

    document.addEventListener('mouseup', () => dragging = false)
    eventsSlideContainer.addEventListener('mousedown', () => dragging = true)

    let deltaTime = 0

    eventsSlideContainer.addEventListener('mousemove', (e) => {
        e.preventDefault()

        if (!dragging)
            return

        vel += e.movementX * fac * deltaTime
    })

    let last = null
    eventsSlideContainer.addEventListener('touchstart', (e) => last = e.touches[0].clientX)

    eventsSlideContainer.addEventListener('touchmove', (e) => {
        let delta = e.touches[0].clientX - last
        vel += delta * fac * deltaTime * 2.0

        last = e.touches[0].clientX;
    });

    let time = new Date().getTime()

    let animation = () => {
        let curTime = new Date().getTime()
        deltaTime = (curTime - time) / 1000
        time = curTime

        if (eventsSlide.children.length == 0) {
            return window.requestAnimationFrame(animation)
        }

        const childBounds = eventsSlide.children[0].getBoundingClientRect()
        const childComputedStyle = window.getComputedStyle(eventsSlide.children[0]);
        const childMargin = parseInt(childComputedStyle.marginRight);

        if (vel < 0) {
            vel = Math.min(-auto, vel + deltaTime * decel)
        } else {
            vel = Math.max(-auto, vel - deltaTime * decel)
        }

        left += deltaTime * vel

        if (eventsSlide.children.length <= 3) {
            left = Math.min(initialLeft, left);
            left = Math.max(-eventsSlide.scrollWidth + 0.5 * document.documentElement.clientWidth, left)
        }

        eventsSlide.style.left = String(left) + "px"

        if (eventsSlide.children.length <= 3) {
            return window.requestAnimationFrame(animation)
        }

        if (childBounds.left < -childBounds.width - childMargin) {
            const ele = eventsSlide.children[0]
            const ele2 = eventsSlide.children[1]

            left = ele2.getBoundingClientRect().left - childMargin
            eventsSlide.style.left = String(left) + 'px'
            ele.remove()
            eventsSlide.appendChild(ele)
        }

        if (childBounds.left > initialLeft + childMargin) {
            const ele = eventsSlide.children[eventsSlide.children.length - 1]
            ele.remove()

            eventsSlide.insertBefore(ele, eventsSlide.children[0])
            left = -ele.getBoundingClientRect().width - 2 * childMargin + vel * deltaTime
            eventsSlide.style.left = String(left) + "px"
        }

        return window.requestAnimationFrame(animation)
    }

    window.requestAnimationFrame(animation)

    eventsSlide.addEventListener('mouseover', () => auto = 0)
    eventsSlide.addEventListener('mouseleave', () => auto = 75)

    let count = events.length

    for (const event of events) {
        const url = event.image.url
        const img = new Image()
        img.src = url

        img.onload = () => {
            console.log(`loaded ${url}`)

            if (--count <= 0) {
                const logo1 = document.querySelector('.logo1')
                const logo2 = document.querySelector('.logo2')
                const logo3 = document.querySelector('.logo3')
                const heroButtons = document.querySelectorAll('.hero__button')
                const body = document.querySelector('body')

                const loading1 = document.querySelector('#loading1')
                const loading2 = document.querySelector('#loading2')
                const loadingIcon = document.querySelector('#loading-icon')
                const loadingContainer = document.querySelector('#loading-container')

                loading1.style.transform = 'translateX(-100%)'
                loading2.style.transform = 'translateX(100%)'
                loadingIcon.style.transform = 'scale(0) rotate(359deg)'

                setTimeout(() => {
                    logo1.classList.add('animate-logo1')
                    logo2.classList.add('animate-logo2')
                    logo3.classList.add('animate-logo3')

                    for (const btn of heroButtons) {
                        btn.classList.add('animate-hero-button')
                    }

                    loadingContainer.remove()
                }, 1000)
            }
        }
    }
}

main()