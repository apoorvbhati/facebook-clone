import { useRef, useState } from "react";
import Header from "../../components/header";
import useClickOutside from "../../helpers/clickOutside";

export default function Home() {
  // const [visible, setVisible] = useState(true);
  // const el = useRef();
  // useClickOutside(el, () => {
  //   setVisible(false);
  // });

  return (
    <>
      <Header />
      {/* {visible && <div className="card" ref={el}></div>} */}
    </>
  );
}
