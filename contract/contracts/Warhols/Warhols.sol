// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import {IBlitmap} from "../Interfaces/IBlitmap.sol";
import {Base64} from "../Base64.sol";
import {strings} from "../StringUtils.sol";

import "hardhat/console.sol";


contract Warhols is ERC721, Ownable, ERC165Storage {
    using strings for *;

    uint256 public constant MINT_PRICE = 0.02 ether;
    uint256 public constant ROYALTY_AMOUNT = 10;
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0xc155531d;
    address public BLITMAP_ADDRESS;

    constructor(address blitmapAddress) payable ERC721("Warhol Blitmaps", "WBLIT") {
        _registerInterface(_INTERFACE_ID_ERC2981);
        BLITMAP_ADDRESS = blitmapAddress;
    }

    function ownerMint(uint256 tokenId) public payable {
        // require(msg.value == MINT_PRICE, "WB:oM:421");
        require(!_exists(tokenId), "WB:oM:09");
        // require(msg.sender == IBlitmap(BLITMAP_ADDRESS).ownerOf(tokenId), "WB:oM:421");

        _mint(msg.sender, tokenId);
    }

    /* solhint-disable quotes */

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":" Blitmonroes ',
                                IBlitmap(BLITMAP_ADDRESS).tokenNameOf(tokenId),
                                '", "description":" Blitmonroes are onchain Blitmap derivatives. To construct the artwork, the original Blitmap with corresponding token ID is fetched, filtered and collaged to a new onchain SVG.',
                                '"image": "',
                                "data:image/svg+xml;base64,",
                                wrapRecursively(tokenId, 2),
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function wrapRecursively(uint256 tokenId, uint256 depth) public view returns (bytes memory) {
        uint256 recursions = depth * 4;
        string memory canvas = uint2str(recursions * 64);
        bytes memory container = abi.encodePacked(
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ",
            canvas,
            " ",
            canvas,
            "' width='",
            canvas,
            "' height='",
            canvas,
            "' >"
        );
        bytes memory composite = "";

        for (uint256 index = 0; index < recursions; index++) {

            uint256 quadrant = index % 4;
            string memory x = uint2str((quadrant % 2 + index) * 64);
            string memory y = uint2str(quadrant % 4 < 2 ? index * 64 : index + 1 * 64);

            composite = abi.encodePacked(
                composite,
                "<svg viewBox='0 0 64 64' ",
                "x='",
                x,
                "' y='",
                y,
                "' >",
                collage(tokenId),
                "</svg>"
            );
        }

        return
            abi.encodePacked(
                container,
                composite,
                "</svg>"

        );

    }

    function collage(uint256 tokenId) internal view returns (bytes memory) {
        string memory viewbox = 'viewBox="0 0 32 32">';
        strings.slice memory main = IBlitmap(BLITMAP_ADDRESS).tokenSvgDataOf(tokenId).toSlice();
        strings.slice memory start = main.split(viewbox.toSlice());

        return abi.encodePacked(
            '<svg viewBox="0 0 64 64"><svg viewBox="0 0 32 32" width="32" height="32">',
            main.toString(),
            '<svg viewBox="0 0 32 32" width="32" height="32" x="32">',
            campbells(),
            main.toString(),
            '</svg><svg viewBox="0 0 32 32" width="32" height="32" y="32">',
            electricChair(),
            main.toString(),
            '</svg><svg viewBox="0 0 32 32" width="32" height="32" x="32" y="32">',
            marilyn(),
            main.toString(),
            '</svg></svg>'
        );

    }

    function campbells() internal view returns (string memory) {
        return '<filter id="campbells"><feColorMatrix type="matrix" values="1 0 0 1.9 -2.2 0 1 0 0.0 0.3 0 0 1 0 0.5 0 0 0 1 0.2"></feColorMatrix></filter><svg filter="url(#campbells)">';
    }

    function electricChair() internal view returns (string memory) {
        return '<filter id="ec"><feColorMatrix type="matrix" values="1 0 0 0 0 -0.4 1.3 -0.4 0.2 -0.1 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter><svg filter="url(#ec)">';
    }

    function marilyn() internal view returns (string memory) {
        return '<filter id="marilyn"><feColorMatrix type="matrix" values="1 0 0 1.7 -1.6 0 1 0 0.0 0.3 -0.7 0 1 0 0.5 0 0 0 1 0.2"></feColorMatrix></filter><svg filter="url(#marilyn)">';
    }

    function royaltyInfo(
        uint256 tokenId,
        uint256 value,
        bytes calldata _data
    ) external view returns (address _receiver, uint256 royaltyAmount) {
        royaltyAmount = (value * ROYALTY_AMOUNT) / 100;

        return (owner(), royaltyAmount);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165Storage, ERC721) returns (bool) {
        return ERC165Storage.supportsInterface(interfaceId);
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
