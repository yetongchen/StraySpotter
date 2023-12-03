let nodeGeocoder = import ("node-geocoder");

const exportedMethods = {
    validateId(id){
        if (!id) throw 'Error: You must provide an id';
        if (typeof id !== 'string') throw 'Error: id must be a string';
        id = id.trim();
        if (id.length === 0)
            throw 'Error:id cannot be an empty string or just spaces';
        return id;
    },
    validateName(name) {
        if (!name) {
            throw `Error: name not supplied`;
        }
        if (typeof name !== "string" || name.trim().length === 0) {
            throw `Error: name should be a valid string (no empty spaces)`;
        }

        name = name.trim();
        const nameRegex = /^[a-zA-Z]+$/;
        if (!nameRegex.test(name)) {
            throw `Error: name must only contain character a-z and should not contain numbers`;
        }
        if (name.length < 2 || name.length > 25) {
            throw `Error: name length must be at least 2 characters long with a max of 25 characters`
        }
        return name;
    },
    validateEmail(email) {
        if (!email) {
            throw `Error: email not supplied`;
        }
        if (typeof email !== "string" || email.trim().length === 0) {
            throw `Error: email should be a valid string (no empty spaces)`;
        }
    
        email = email.trim();
        // Simple regex for email validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
            throw `Error: email is not a valid email address`;
        }
        return email;
    },
    validatePassword(password) {
        if (!password) {
            throw `Error: password not supplied`;
        }
        if (typeof password !== "string" || password.trim().length === 0) {
            throw `Error: password should be a valid string (no empty spaces)`;
        }
    
        password = password.trim();
        // Regex for password: Minimum eight characters, at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw `Error: password does not meet the password criteria`;
        }
        return password;
    },    
    validateSpecies(species) {
        if (typeof species !== "string" || species.trim().length === 0) {
            throw `Error: Species should be a valid string (no empty spaces)`;
        }
        const vaildAnimalSpecies = ["Cat", "Dog", "Others"];
        species = species.trim();
        if (!vaildAnimalSpecies.includes(species))
            throw `${species} is not an vaild animal species.`;
        return species;
    },
    validateHealthCondition(health){
        if (typeof health !== "string" || health.trim().length === 0)
            throw "Error: health must be a non-empty string";
        health = health.trim();
        const vaildAnimalHealthCondition = ["Good", "Normal", "Bad"];
        if (!vaildAnimalHealthCondition.includes(health))
            throw `Error: ${health} is not an vaild animal Health Condition.`;
        return health;
    },
    validateDescription(description){
        if (typeof description !== "string" || description.trim().length === 0) {
            throw `Error: description should be a valid string (no empty spaces)`;
        }
        description = description.trim();
        if(description.length < 5 || description > 10000){
            throw `Error: description should have more than 5 chars and less than 10 thousand chars`;
        }
        return description;
    },
    generateCurrentDate(){
        const date = new Date();
        // const year = date.getFullYear();
        // const month = date.getMonth() + 1;
        // const day = date.getDate();
        // const hour = date.getHours();
        // const minutes = date.getMinutes();
        // const curDate = `${month}/${day}/${year} ${hour}:${minutes}`;

        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: 'short' // This adds the time zone information
        };
        const curDate = new Intl.DateTimeFormat('en-US', options).format(date);
        return curDate;
    },
    validateDateTime(inputDate){
        const currentDate = new Date();

        if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(inputDate)) {
            throw `Error: ${inputDate} is not a valid date.`;
        }

        const [datePart, timePart] = inputDate.split(" ");
        const [month, day, year] = datePart.split("/").map(Number);

        const validYear = currentDate.getFullYear() + 2;

        if (year < 1900 || year > validYear || month === 0 || month > 12) {
            throw `Error: ${inputDate} is not a valid date.`;
        }

        const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if ((year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) && month === 2) {
            monthLength[1] = 29;
        }

        if (!(day > 0 && day <= monthLength[month - 1])) {
            throw `Error: ${inputDate} is not a valid date.`;
        }

        if (!/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/.test(timePart)) {
            throw `Error: ${inputDate} is not a valid time.`;
        }

        return inputDate;
    },
    validateLocation(){
        if (!location) {
            throw "Error: Please provide a location";
        }
        if (typeof location !== "string") {
            throw "Error: Location should be a string";
        }
        const trimmedLocation = location.trim();
        if (trimmedLocation.length === 0) {
            throw "Error: Location should not contain only spaces";
        }
        const isValidFormat = /^(([A-Z]*[a-z]*(\d)*(\s)*(\,)*(\#)*(\*)*(\_)*))*$/.test(trimmedLocation);
        if (!isValidFormat) {
            throw "Error: Invalid location format";
        }
    },
    async convertLocation(location) {
        try {
            this.validateLocation(location);

            const options = {
                provider: "openstreetmap",
            };

            const geoCoder = (await nodeGeocoder)(options);
            const result = await geoCoder.geocode(location);

            if (!result || result.length < 1) {
                throw "Error: Invalid location";
            }

            const {state, city} = result[0];

            if (!/^(([A-Z]*[a-z]*(\d)*(\s)*(\,)*(\#)*(\*)*(\_)*))*$/.test(state)) {
                throw "Error: Invalid state in the location result";
            }

            if (!/^(([A-Z]*[a-z]*(\d)*(\s)*(\,)*(\#)*(\*)*(\_)*))*$/.test(city)) {
                throw "Error: Invalid city in the location result";
            }
            return result;
        } catch (error) {
            throw error;
        }
    },
    validateGender(gender) {
        if (!gender) {
            throw "Error: Gender not supplied";
        }
        if(typeof gender !== "string" || gender.trim().length === 0){
            `Error: gender should be a valid string (no empty spaces)`;
        }
        const trimmedGender = gender.trim().toLowerCase();

        if (trimmedGender !== "male" && trimmedGender !== "female") {
            throw "Error: Gender must be either 'male' or 'female'";
        }
        return trimmedGender;
    }
}
export default exportedMethods;