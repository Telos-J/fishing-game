import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { loader } from './assets'
import { world, horizon } from './game'

let caughtFish = 0
let coins = 0

const numFish = 1000,
    fishes = new PIXI.Container()
// fishes = new PIXI.ParticleContainer(numFish, { vertices: true, rotation: true })

fishes.name = 'fishes'

function spawnFishes() {
    const boundary = world.getChildByName('boundary')
    const sea = world.getChildByName('sea')
    const texture = loader.resources.fish.texture

    for (let i = 0; i < numFish; i++) {
        const fish = new PIXI.Sprite(texture);
        fish.anchor.set(0.5)
        fish.scale.set(0.8)
        fish.position.set(Math.random() * boundary.width, Math.random() * (boundary.height - horizon - 50) + horizon + 50)
        fish.rotation = Math.random() * Math.PI * 2
        fish.speed = 1.5
        fish.velocity = new PIXI.Point(fish.speed * Math.cos(fish.rotation), fish.speed * Math.sin(fish.rotation))
        fish.serperationSurface = new PIXI.Point()
        fishes.addChild(fish);
        if (i === 0) makeNeighborhood(fish)
    }

    fishes.mask = boundary
    world.addChild(fishes)
}

function controlFishes(deltaTime) {
    for (const fish of fishes.children) {
        collideNet(fish)
        move(fish, deltaTime)
        if (fish.caught && fish.position.y < horizon) collectFish(fish)
    }
}

function makeNeighborhood(fish) {
    const neighborhood = new PIXI.Graphics()
    neighborhood.beginFill(0xffffff, 0.5)
    neighborhood.moveTo(0, 0)
    neighborhood.arc(0, 0, fish.width * 3, -Math.PI * 2 / 3, Math.PI * 2 / 3)
    fish.addChild(neighborhood)
    fish.neighborhood = neighborhood
    console.log(fish.getGlobalPosition(), neighborhood.getGlobalPosition())
}

function inNeighborhood(fish) {
    for (const otherFish of fishes.children) {
        if (fish.neighborhood.containsPoint(otherFish.getGlobalPosition())) otherFish.tint = 0xffff00
        else otherFish.tint = 0xffffff
    }
}

function move(fish, deltaTime) {
    const boat = world.getChildByName('boat')
    const net = boat.getChildByName('net')

    if (fish.caught) gsap.to(fish, { y: `+=${net.vy}` })
    else {
        const range = 200
        const max = 0.15
        const threshold = horizon + range

        if (fish.position.y < threshold)
            fish.serperationSurface.y = (max / range ** 2) * (fish.position.y - threshold) ** 2
        else fish.serperationSurface.y = 0

        fish.velocity.y += fish.serperationSurface.y
        fish.rotation = Math.atan2(fish.velocity.y, fish.velocity.x)
        fish.velocity.set(fish.speed * Math.cos(fish.rotation), fish.speed * Math.sin(fish.rotation))

        if (fish.position.y < horizon) fish.velocity.y += 0.098

        fish.position.x += deltaTime * fish.velocity.x
        fish.position.y += deltaTime * fish.velocity.y

        if (fish.rotation > Math.PI / 2 || fish.rotation < -Math.PI / 2) fish.scale.y = -0.8
        else fish.scale.y = 0.8
    }

    bound(fish)
    if (fish.neighborhood) inNeighborhood(fish)
}

function bound(fish) {
    const boundary = world.getChildByName('boundary')
    if (fish.position.x - fish.width / 2 > boundary.width)
        fish.position.x = -fish.width / 2
}

function collideNet(fish) {
    const boat = world.getChildByName('boat')
    const net = boat.getChildByName('net')
    const mask = net.getChildByName('mask')

    if (mask.containsPoint(fish.getGlobalPosition())) fish.caught = true
    else if (fish.position.y > horizon) fish.caught = false
}

function collectFish(fish) {
    const boat = world.getChildByName('boat')
    fish.scale.y = 0.8
    gsap.to(fish, {
        x: boat.position.x + boat.width / 3,
        y: boat.position.y + boat.height / 2,
        rotation: 0,
        onComplete: () => {
            const removed = fishes.removeChild(fish)
            if (removed) {
                caughtFish++
                const fishMeter = document.querySelector('#fish-meter').contentDocument
                fishMeter.querySelector('#caught').innerHTML = `${caughtFish}/40`
                gsap.to(fishMeter.querySelector('#gauge'), {
                    attr: { width: 220 * caughtFish / 40 }
                })

                coins += 2
                const coinMeter = document.querySelector('#coin-meter').contentDocument
                coinMeter.querySelector('#coin').innerHTML = coins
                gsap.to(coinMeter.querySelector('#gauge'), {
                    attr: { width: 220 * coins / 200 }
                })
            }
        }
    })
}


export { fishes, spawnFishes, controlFishes }
