# G1R-Resources
Some basic resources for modding Gothic 1 Remake


## Blueprint Example Mod Files
Within the blueprint example mod files folder, there are both a `Packaged`, and `Source` folders for both the `Alpakit` and `UE4SS` version of the example. 

**The Packaged Files:**
- Alpakit Version: Place the `Mods` folder into your games root `G1R` folder.
- UE4SS Version: Place the `Content` folder into your games root `G1R` folder.

**The Source Files:**
- Alpakit Version: Place the `Mods` folder into your Unreal Engine project's root folder.
- UE4SS Version: Place the `Content` folder into your Unreal Engine project's root folder.

**How To Test:**
- Alpakit Version: Press `Shift+A` while in the game world.
  - Requires the G1R [BP Modloader & Console Enabler](https://www.nexusmods.com/gothic1remake/mods/1) mod to be installed. 
- UE4SS Version: Press `Shift+U` while in the game world.
  - Requires the latest experimental [UE4SS](https://github.com/UE4SS-RE/RE-UE4SS) release to be installed. 

> [!NOTE]
> Your Unreal Engine project's root folder would also be named `G1R` when using the [unofficial modkit](https://github.com/Kein/G1R). 

## Example Lua Mod
The Hello World Lua mod example, was created specifically for when using UE4SS. 

The Entire `ExampleLuaMod` folder should be placed into your games directory at the following path;

```
Gothic 1 Remake\G1R\Binaries\Win64\ue4ss\Mods
```

Once installed, you will be able to press the `H` key to see `Key pressed: H - Hello World!` printed to the ue4ss log. 

> [!NOTE]
> The Example Lua mod assumes you have already installed UE4SS correctly before adding the example mod. 
