# How to create a usmap mappings file for FModel. 

- Install UE4SS into your chosen game
- Enable the UE4SS GUI Console
    - In the UE4SS-settings.ini file, locate the `GuiConsoleEnabled` and `GuiConsoleVisible` variables and set each of them to `1` (they will normally be set to `0` (disabled) by default)
- Dump the mappings 
    - Load up your game and wait for the various UE4SS console buttons to be available
    - Click the `Dumpers` tab
    - Select `Generate Mappings`

The mappings file should now be within your Win64/ue4ss folder. 

You can now copy it elsewhere as needed, link it to FModel, and access the game assets as needed. 

