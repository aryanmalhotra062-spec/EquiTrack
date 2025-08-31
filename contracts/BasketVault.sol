// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Vault that takes EQT deposits and mints 1:1 basket shares (ERC-20).
contract BasketVault is ERC20, Ownable {
    IERC20 public immutable EQT;
    uint8 private immutable _decimalsOverride = 18;

    /// @param eqt Address of the EQT token (the asset backing this basket)
    /// @param name_ ERC20 name for the basket (e.g., "EquiTrack FinTech Basket")
    /// @param symbol_ ERC20 symbol for the basket (e.g., "eFIN")
    constructor(address eqt, string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
        Ownable(msg.sender) // OZ v5 pattern
    {
        EQT = IERC20(eqt);
    }

    function decimals() public view override returns (uint8) {
        return _decimalsOverride;
    }

    /// @notice Deposit EQT and receive basket shares 1:1
    function deposit(uint256 amount) external {
        require(EQT.transferFrom(msg.sender, address(this), amount), "EQT transferFrom failed");
        _mint(msg.sender, amount);
    }

    /// @notice Redeem basket shares for EQT 1:1
    function redeem(uint256 shares) external {
        _burn(msg.sender, shares);
        require(EQT.transfer(msg.sender, shares), "EQT transfer failed");
    }
}
