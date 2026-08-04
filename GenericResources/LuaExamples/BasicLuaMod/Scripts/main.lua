
-- This is an example Lua mod using UE4SS. 
-- It demonstrates how to register a key binding that triggers a function when the specified key is pressed.

RegisterKeyBind(Key.H, function()
    print("Key pressed: H - Hello World!")
end)
