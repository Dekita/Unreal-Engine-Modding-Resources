# Unreal Engine Modding Resources
This repository contains some basic resources helpful for modding Unreal Engine games.

Within the repo's additional sub-folders, there are specific resources for specific games. Things like specific blueprint or LUA example mods, game specific splash screens for using within the Unreal Engine editor, and potentially a usmap or umap file for using within FModel to access the games assets.  

Within the [GenericResources](./GenericResources/) folder, you will find resources that are helpful in general, such as basic LUA mods, and splash screen images. 

## Custom Editor Splash Screens
Within any of the `EditorSplashScreens` folder, there is a number of bitmap files (`.bmp`). 

To use any of them within your own Unreal Engine project follow these simple steps;
- Open your Unreal Engine project folder
- Open your `Project Settings` menu
- Search for `Splash`
- Under `Platforms - Windows`, and `Editor Splash`, click the three little dots to select the desired splash image.
- When asked, allow your project to import the asset. This will create a `Splash` folder within your project, with a `Splash.uasset` of your selected file.

When you next load the editor, it will use your selected splash image. 

## What Are ".usmap" Files?
These files are for use within programs like `FModel`, and are required to get full data on specific assets. Within FModel, you can easily select the custom mappings file to use from your local files. After selecting a valid mappings file, FModel will then be able to properly view and export assets. 
