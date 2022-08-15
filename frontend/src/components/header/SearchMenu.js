import React, { useRef, useState, useEffect } from "react";
import useClickOutside from "../../helpers/clickOutside";
import { Return, Search } from "../../svg";

export default function SearchMenu({ color, setShowSearchMenu }) {
  const menu = useRef(null);
  const input = useRef(null); // to focus on the entire div
  const [iconvisible, seticonVisible] = useState(true);

  // to focus the input on the intial render
  useEffect(() => {
    input.current.focus();
  }, []);

  useClickOutside(menu, () => {
    setShowSearchMenu(false);
  });

  return (
    <div className="header_left search_area scrollbar" ref={menu}>
      <div className="search_wrap">
        <div className="header_logo">
          <div
            className="circle hover1"
            onClick={() => setShowSearchMenu(false)}
          >
            <Return color={color} />
          </div>
        </div>
        <div
          className="search"
          onClick={() => {
            input.current.focus();
          }}
        >
          {iconvisible && (
            <div>
              <Search color={color} />
            </div>
          )}
          <input
            type="text"
            placeholder="Search Facebook"
            ref={input}
            onFocus={() => seticonVisible(false)}
            onBlur={() => seticonVisible(true)} // onBlur is opposite of onFocus
          />
        </div>
      </div>
      <div className="search_history_header">
        <span>Recent Searches</span>
        <a>Edit</a>
      </div>
      <div className="search_history"></div>
      <div className="search_results scrollbar"></div>
    </div>
  );
}
