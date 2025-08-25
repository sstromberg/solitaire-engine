# Generalized solitaire

An object-oriented generalized Solitaire webapp, supporting classics as well as newer variants.

## Motivation

I've always enjoyed simple computer games, going back to the era of "stuff bundled with Windows 95". If I'm dining out and there's a TV on somewhere, I need to sit facing the other way or else it'll catch my eyeline enough to distract the person I'm talking to... but if I need to listen to a lecture, clicking away at Minesweeper makes it easier to maintain focus. Brains!

More recently, I found the solitaire variants that [Zachtronics](https://www.zachtronics.com/) releases with each of their extremely nerdy, niche games (e.g., TIS-1000, where you write algorithms using simplified machine language), and was charmed by the creativity and variety of their implementations.

In various lEaRn tO CoDe bootcamps, I've built toy versions of towers of hanoi, nim, tic tac toe, and so on, as ways of exploring classes and inheritance, and it finally struck me: I should build an architecture generalized enough to accommodate both the classics and more unusual variants. Unlike towers of hanoi, it's something I'd actually use.

## Architecture

And my first thought was, "And I'll build it in Python!" because it's the language I know best. A little poking around online disabused me of that, and since this is (another) Cursor-assisted project, I figured I could work in a lightweight JavaScript framework -- while I'm not deeply immersed in web-dev debates, I have some colleagues who are... opinionated about the costs of the React Era and how to move forward. So in the same way I'm scratching my way toward a blog with Eleventy, I figured I'd build a little browser-based game using Svelte.