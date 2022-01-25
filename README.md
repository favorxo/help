# Help, I want to rewrite [Tachiyomi's](https://github.com/tachiyomiorg/tachiyomimanga) reader in React Native.
# Wanted [behaviour](https://www.youtube.com/watch?v=MU2-9qw7xYg)
[![Wanted Behavior](https://img.youtube.com/vi/MU2-9qw7xYg/0.jpg)](https://www.youtube.com/watch?v=MU2-9qw7xYg)

# Key points of the reader:
* You can zoom in/out 
* Ability to set maximum/minimum zoom scale
* When you zoom out the reader is centered
* When you zoom in you can't get out of content(go beyond images)
* When zooming the translate x, y will be in the center of your pinch gesture
* Double tap to reset zoom
# TODO/Whys
* I don't know why, but without wrapping whole reader into screen with react-navigation, gestures don't appear to work
