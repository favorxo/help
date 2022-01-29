# Help, I want to rewrite [Tachiyomi's](https://github.com/tachiyomiorg/tachiyomi) reader in React Native.
# Wanted [behaviour](https://www.youtube.com/watch?v=MU2-9qw7xYg)
[![Wanted Behavior](https://img.youtube.com/vi/MU2-9qw7xYg/0.jpg)](https://www.youtube.com/watch?v=MU2-9qw7xYg)

# Key points of the reader:
* Webtoon view(top-to-bottom) or regular(left-to-right)
* You can zoom in/out 
* Ability to set maximum/minimum zoom scale
* When you zoom out the reader is centered by width
* When you zoom in (zoom scale <= 1) you can't get out of content(go beyond images)
* Double tap to reset zoom
* Scroll experience like with `<ScrollView />`
# TODO/Whys
* I don't know why, but without wrapping whole reader into screen with react-navigation, gestures don't appear to work
