abstract class Application {
    constructor() {
        console.log('Created application');
    }

    abstract OnLoad(): void;
}

export { Application };