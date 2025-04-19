class Start extends Scene {
    create() {
        Engine.inventory = [];
        this.engine.setTitle(this.engine.storyData.Title); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        this.key = key;
        let locationData = this.engine.storyData.Locations[key]; // TODO: use `key` to get the data object for the current story location
        this.engine.show(locationData.Body); // TODO: replace this text by the Body of the location data
        
        for (let [id, item] of Object.entries(this.engine.storyData.Items)) {
            if (item.Location === this.key) {
                this.engine.show(`You see ${item.Description}`);
                this.engine.addChoice(`Pick up ${item.Name}`, { Action: "pickup", ItemId: id });
            }
        }

        if(locationData.Choices && locationData.Choices.length > 0) { // TODO: check if the location has any Choices
            for(let choice of locationData.Choices) { // TODO: loop over the location's Choices
                this.engine.addChoice(choice.Text, choice); // TODO: use the Text of the choice
                // TODO: add a useful second argument to addChoice so that the current code of handleChoice below works
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if (!choice) {
            return this.engine.gotoScene(End);
        }

        // Picking up an item
        if (choice.Action === "pickup") {
            Engine.inventory.push(choice.ItemId);
            // remove item from its location
            this.engine.storyData.Items[choice.ItemId].Location = null;
            this.engine.show(`You picked up the ${choice.ItemId}.`);
            return this.engine.gotoScene(Location, this.key);
        }
        
        // Trying to go through a locked door
        if (choice.LockedBy) {
            if (!Engine.inventory.includes(choice.LockedBy)) {
              this.engine.show("The door is locked. You need a key.");
              return this.engine.gotoScene(Location, this.key);
            }
            // unlock permanently
            choice.LockedBy = null;
        }
        
        // Normal travel
        this.engine.show(`> ${choice.Text}`);
        const locationData = this.engine.storyData.Locations[this.key];
        if (locationData.Mechanism) {
            // if balcony, swap to BalconyDoorScene
            if (locationData.Mechanism === "BalconyDoor") {
              return this.engine.gotoScene(BalconyDoorScene, choice.Target);
            }
        }

        // default
        this.engine.gotoScene(Location, choice.Target);
    }
}

class BalconyDoorScene extends Location {
    create(key) {
        super.create(key);
        if (!this.engine.balconyOpen) {
            this.engine.show("The sliding door to the outside is closed.");
            this.engine.addChoice("Open the balcony door", { Action: "openDoor" });
            return;
        }
    }
  
    handleChoice(choice) {
        if (choice && choice.Action === "openDoor") {
            this.engine.balconyOpen = true;
            this.engine.show("You slide open the balcony door.");
            return this.engine.gotoScene(Location, this.key);
        }
        return super.handleChoice(choice);
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');