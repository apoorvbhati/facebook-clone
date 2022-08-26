import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { useReducer, useState, useEffect } from "react";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Home from "./pages/home";
import LoggedInRoutes from "./routes/LoggedInRoutes";
import NotLoggedInRoutes from "./routes/NotLoggedInRoutes";
import Activate from "./pages/home/activate";
import Reset from "./pages/reset";
import CreatePostPopup from "./components/createPostPopup";
import axios from "axios";

function reducer(state, action) {
  switch (action.type) {
    case "POSTS_REQUESTS":
      return { ...state, loading: true, error: "" };
    case "POSTS_SUCCESS":
      return { ...state, loading: false, posts: action.payload, error: "" };
    case "POSTS_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function App() {
  const { user } = useSelector((state) => ({ ...state }));
  const [visible, setVisible] = useState(false);
  const [{ loading, error, posts }, dispatch] = useReducer(reducer, {
    loading: false,
    posts: [],
    error: "",
  });

  useEffect(() => {
    console.log("effect runs");
    getAllPosts();
  }, []);

  const getAllPosts = async () => {
    try {
      dispatch({ type: "POSTS_REQUESTS" });
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/getAllPosts`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log(data);
      dispatch({
        type: "POSTS_SUCCESS",
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: "POSTS_ERROR",
        payload: error.response.data.message,
      });
    }
  };

  return (
    <div>
      {visible && <CreatePostPopup user={user} setVisible={setVisible} />}
      <Routes>
        <Route element={<LoggedInRoutes />}>
          <Route path="/profile" element={<Profile />} exact />
          <Route
            path="/"
            element={<Home setVisible={setVisible} posts={posts} />}
            exact
          />
          <Route path="/activate/:token" element={<Activate />} />
        </Route>
        <Route element={<NotLoggedInRoutes />}>
          <Route path="/login" element={<Login />} exact />
        </Route>
        <Route path="/reset" element={<Reset />} />
      </Routes>
    </div>
  );
}

export default App;
