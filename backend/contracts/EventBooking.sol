
pragma solidity >=0.7.0 <0.9.0;

contract EventBooking {
    struct Event {
        string name;
        uint capacity;
        uint registered;
    }

    mapping(uint => Event) public events;
    mapping(address => mapping(uint => bool)) public reservations;
    uint public eventCount;
    address public owner;
()
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can create events");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createEvent(string memory _name, uint _capacity) public onlyOwner {
        require(_capacity > 0, "Capacity must be greater than 0");
        events[eventCount] = Event(_name, _capacity, 0);
        eventCount++;
    }

    function reserve(uint eventId) public {
        require(eventId < eventCount, "Invalid event ID");
        require(!reservations[msg.sender][eventId], "Already reserved");
        require(events[eventId].registered < events[eventId].capacity, "Event is full");

        reservations[msg.sender][eventId] = true;
        events[eventId].registered++;
    }
}