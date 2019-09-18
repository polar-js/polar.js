const pol = new Polar('canvas-id');

pol.onready = () => {
    console.log('ready')
};

pol.ontick = () => {
    console.log('tick')
}