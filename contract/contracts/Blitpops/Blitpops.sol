// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";


import {IBlitmap} from "../Interfaces/IBlitmap.sol";
import {Base64} from "../Base64.sol";
import {strings} from "../StringUtils.sol";


contract Blitpops is Ownable, ERC165Storage, ERC721Enumerable {
    using strings for *;

    uint256 public constant MINT_PRICE = 0.02 ether;
    uint256 public constant ROYALTY_AMOUNT = 10;
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0xc155531d;
    address public BLITMAP_ADDRESS;
    mapping(string => string) internal filters;
    string[] internal filterNames;

    struct FilterMatrix {
        string filter1;
        string filter2;
        string filter3;
    }
    mapping(uint256 => FilterMatrix) internal filterMap;

    constructor(address blitmapAddress) payable ERC721("Blitmonroes", "BLITMON") {
        _registerInterface(_INTERFACE_ID_ERC2981);
        BLITMAP_ADDRESS = blitmapAddress;
        filters['og'] = '<svg>';
        filters['campbells'] = '<filter id="campbells"><feColorMatrix type="matrix" values="1 0 0 1.9 -2.2 0 1 0 0.0 0.3 0 0 1 0 0.5 0 0 0 1 0.2"></feColorMatrix></filter><svg filter="url(#campbells)">';
        filters['electric-chair'] = '<filter id="ec"><feColorMatrix type="matrix" values="1 0 0 0 0 -0.4 1.3 -0.4 0.2 -0.1 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter><svg filter="url(#ec)">';
        filters['marilyn'] = '<filter id="marilyn"><feColorMatrix type="matrix" values="1 0 0 1.7 -1.6 0 1 0 0.0 0.3 -0.7 0 1 0 0.5 0 0 0 1 0.2"></feColorMatrix></filter><svg filter="url(#marilyn)">';
        filters['brillo'] = '<filter id="brillo"><feColorMatrix type="matrix" values="0 1.0 0 0 0 0 1.0 0 0 0 0 0.6 1 0 0 0 0 0 1 0 "/></filter><svg filter="url(#brillo)">';
        filters['b&w'] = '<filter id="bw"><feColorMatrix type="matrix" values="0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 1 0 "/></filter><svg filter="url(#bw)">';
        filterNames = ['og', 'campbells', 'electric-chair', 'marilyn', 'brillo', 'b&w'];
    }

    function addFilter(string memory name, string memory filter) public onlyOwner {
        filterNames.push(name);
        filters[name] = filter;
    }

    function listFilters() public view returns(string[] memory) {
        return filterNames;
    }

    function ownerMint(
        uint256 tokenId,
        string memory filter1,
        string memory filter2,
        string memory filter3) public payable {
        // require(msg.value == MINT_PRICE, "WB:oM:421");
        // require(msg.sender == IBlitmap(BLITMAP_ADDRESS).ownerOf(tokenId), "WB:oM:421");

        filterMap[tokenId] = FilterMatrix({
            filter1: filter1,
            filter2: filter2,
            filter3: filter3
        });

        _mint(msg.sender, tokenId);
    }

    function updateFilters(
        uint256 tokenId,
        string memory filter1,
        string memory filter2,
        string memory filter3
    ) public {
        require(msg.sender == ownerOf(tokenId), "MB:uF:409");
        filterMap[tokenId] = FilterMatrix({
            filter1: filter1,
            filter2: filter2,
            filter3: filter3
        });
    }

    /* solhint-disable quotes */

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        FilterMatrix memory tokenFilters = filterMap[tokenId];
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"Blitmonroes ',
                                IBlitmap(BLITMAP_ADDRESS).tokenNameOf(tokenId),
                                '", "description":"Blitmonroes are onchain Blitmap derivatives. To construct the artwork, the original Blitmap with corresponding token ID is fetched, collaged and filtered to return a modified onchain SVG.',
                                '", "image": "',
                                svgBase64Data(tokenId, tokenFilters.filter1, tokenFilters.filter2, tokenFilters.filter3),
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function svgBase64Data(
        uint256 tokenId,
        string memory filter1,
        string memory filter2,
        string memory filter3
    ) public view returns (string memory) {
        return string(
            abi.encodePacked(
                'data:image/svg+xml;base64,',
                Base64.encode(svgRaw(tokenId, filter1, filter2, filter3))
            )
        );
    }

    function svgRaw(
        uint256 tokenId,
        string memory filter1,
        string memory filter2,
        string memory filter3
    ) internal view returns (bytes memory) {
        string memory viewbox = 'viewBox="0 0 32 32">';
        strings.slice memory main = IBlitmap(BLITMAP_ADDRESS).tokenSvgDataOf(tokenId).toSlice();
        strings.slice memory start = main.split(viewbox.toSlice());

        return abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><svg viewBox="0 0 32 32" width="32" height="32">',
            main.toString(),
            '<svg viewBox="0 0 32 32" width="32" height="32" x="32">',
            filters[filter1],
            main.toString(),
            '</svg><svg viewBox="0 0 32 32" width="32" height="32" y="32">',
            filters[filter2],
            main.toString(),
            '</svg><svg viewBox="0 0 32 32" width="32" height="32" x="32" y="32">',
            filters[filter3],
            main.toString(),
            '</svg></svg>'
        );
    }

    function royaltyInfo(
        uint256 tokenId,
        uint256 value,
        bytes calldata _data
    ) external view returns (address _receiver, uint256 royaltyAmount) {
        royaltyAmount = (value * ROYALTY_AMOUNT) / 100;

        return (owner(), royaltyAmount);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165Storage, ERC721Enumerable) returns (bool) {
        return ERC165Storage.supportsInterface(interfaceId);
    }
}
