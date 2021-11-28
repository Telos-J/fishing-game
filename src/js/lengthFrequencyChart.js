import { gsap } from 'gsap'
import { gameStatus } from './game'

const LF = document.querySelector('#length-frequency-distribution')
const curtain = document.querySelector('#curtain')

function updateLF(length) {
    gameStatus.LF[Math.floor((length - 0.6) * 20)]++
    if (curtain.classList.contains('open')) animateLF()
}

function animateLF() {
    for (let i = 1; i <= 12; i++) {
        const number = LF.querySelector(`#number${i}`)
        const rect = LF.querySelector(`#rectangle${i}`)
        gsap.to(rect, { scaleY: gameStatus.LF[i - 1] / 30, transformOrigin: 'bottom' })
    }
}

export { updateLF, animateLF }
