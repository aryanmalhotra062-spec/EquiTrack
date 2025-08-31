// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BasketVault.sol";

contract BasketVaultFactory {
    address[] private _baskets;

    event BasketCreated(address indexed basket, string name, string symbol, address asset, address owner);

    function createBasket(
        address asset,
        string memory name,
        string memory symbol,
        address owner
    ) external returns (address basket) {
        basket = address(new BasketVault(asset, name, symbol));
        _baskets.push(basket);

        // If your BasketVault is Ownable (it is), hand over control to the chosen owner
        try BasketVault(basket).transferOwnership(owner) { } catch { }

        emit BasketCreated(basket, name, symbol, asset, owner);
    }

    function basketsCount() external view returns (uint256) {
        return _baskets.length;
    }

    function baskets(uint256 i) external view returns (address) {
        return _baskets[i];
    }
}

