// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Base64.sol";

import {StringUtils} from "./libraries/StringUtils.sol";

contract ENS {

    address payable public immutable owner;

    // tld = Top Level Domain (e.g .crypto, .eth)
    // tld => name => address
    mapping(string => mapping(string => address)) private register;
    string[] private names;

    event RegisterName(string name, address indexed owner);
    event UpdateData(string name);

    error NameAlreadyExists();
    error Unauthorized();
    /// `sent` - amount sent by user
    /// `expected` - expected amount to send
    error InvalidFunds(uint expected, uint sent);
    error InvalidName(string name);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor () payable {
       owner = payable(msg.sender);
    }

    // Calculate the cost for creating domain names
    function cost(string calldata name) private pure returns (uint) {
        uint len = StringUtils.strlen(name);
        require(len > 0);
        if (len == 2) {
            return 10 * 10**16; // .1 ether
        } else if (len == 3) {
            return 5 * 10**16; // .05 ether
        } else if (len == 4) {
            return 3 * 10**16; // .03 ether
        } else {
            return 1 * 10**16; // .01 ether
        }
    }  

    // Check the validity of a name
    function validName(string calldata name) private pure returns (bool) {
        return StringUtils.strlen(name) >= 2 && StringUtils.strlen(name) <= 64;
    }

    // Add new name to the register
    function setName(string calldata _name, string calldata _tld) external payable {
        uint nameCost = cost(_name);   
        if (!validName(_name)) revert InvalidName(_name);
        if (msg.value < nameCost) revert InvalidFunds(nameCost, msg.value);
        if (register[_tld][_name] != address(0)) revert NameAlreadyExists();         

        string memory domain = string.concat(_name, ".", _tld);
        register[_tld][_name] = msg.sender;        
        names.push(domain);

        emit RegisterName(string.concat(_name, ".", _tld), msg.sender);        
    }

    // Get address corresponding to a domain name
    function getAddress(string calldata _tld, string calldata _name) public view returns (address) {
        address _address = register[_tld][_name];
        return _address;
    }

    // Get all names created so far
    function getAllNames() external view returns (string[] memory) {
        string[] memory _names = names;
        return _names;
    }

    // Withdraw funds stored in contract
    function withdraw() external payable onlyOwner {
        uint bal = address(this).balance;
        payable(msg.sender).transfer(bal);
    }  
}
