import { createContext, useContext, useEffect, useState } from 'react'
import './App.css'

const RouterContext = createContext(null);

const routes = [
  {
    id: crypto.randomUUID(),
    name: 'Home',
    url: '#/',
    element: <Home />,
  },
  {
    id: crypto.randomUUID(),
    name: 'About',
    url: '#/about',
    element: <About />,
  },
  {
    id: crypto.randomUUID(),
    name: 'Posts',
    url: '#/posts',
    element: <Posts />,
  },
  {
    id: crypto.randomUUID(),
    name: 'Contact',
    url: '#/contact',
    element: <Contact />,
  },
];

const notFound = {
  name: 'Page not found',
  element: <NotFound />,
  // url: '',
}

function getRoute(routeUrl) {
  const route = routes.find(x => x.url === routeUrl);
  return route ?? notFound;
}

const title = "App";

function setTitle(pageTitle) {
  document.title = `${pageTitle} - ${title}`;
}

function App() {
  // const [route, setRoute] = useState(location.hash.length < 2 ? '#/' : location.hash);
  // const [route, setRoute] = useState(location.hash.length < 2 ? routes[0] : getRoute(location.hash));
  const [route, setRoute] = useState(
    () => {
      if(location.hash.length < 2) {
        return routes[0];
      }

      return getRoute(location.hash);
    }
  );

  useEffect(() => {
    setTitle(route.name);
  }, [route]);

  useEffect(() => {
    window.addEventListener('hashchange', function() {
      setRoute(getRoute(location.hash));
    });
  }, []);

  return (
    <div className="container">
      <RouterContext.Provider value={route}>
        <Header />
        <Main />
        <Footer />
      </RouterContext.Provider>
    </div>
  )
}

function Main() {
  return (
    <div className="main">
      <Content />
      <Sidebar />
    </div>
  )
}

function Header() {
  return (
    <div className="header">
      <a href="#/" className='logo'>App</a>
      <Nav />
    </div>
  )
}

function Nav() {
  const route = useContext(RouterContext);

  return (
    <ul className="nav">
      {routes.map(x => 
        <li key={x.id}>
          <a href={x.url} className={route.url === x.url ? 'selected': ''}>{x.name}</a>
        </li>)}
    </ul>
  )
}

function Content() {
  const route = useContext(RouterContext);

  return (
    <div className="content">
      <h1>{route.name}</h1>
      {route.element}
    </div>
  )
}

function Footer() {
  return (
    <div className="footer">&copy; 2024</div>
  )
}

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="widget">
        <LikeBtn />
      </div>
    </div>
  )
}

function LikeBtn() {
  const [likeCount, setLikeCount] = useState(
    localStorage.likeCount ?
    parseInt(localStorage.likeCount) : 0
  );

  useEffect(() =>{
    localStorage.likeCount = likeCount;
  }, [likeCount]);

  function increaseLikeCount() {
    setLikeCount(likeCount + 1);
  }

  return (
    <button className='likeBtn' onClick={increaseLikeCount}>😍 {likeCount}</button>
  )
}

function Home() {
  return (
    <>
    </>
  );
}

function About() {
  return (
    <>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi voluptate error repellat numquam nulla quae corrupti vero sunt delectus minus.</p>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi voluptate error repellat numquam nulla quae corrupti vero sunt delectus minus.</p>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi voluptate error repellat numquam nulla quae corrupti vero sunt delectus minus.</p>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi voluptate error repellat numquam nulla quae corrupti vero sunt delectus minus.</p>
    </>
  );
}

function Contact() {
  return (
    <>
    </>
  );
}

function Posts() {
  const [postId, setPostId] = useState(null);

  return (
    <>
      {postId ? <PostDetail postId={postId} setPostId={setPostId} /> : <PostList setPostId={setPostId} />}
    </>
  )
}

function PostList({ setPostId }) {
  const [posts, setPosts] = useState([]);
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const offset = (currentPage - 1) * limit;
    fetch(`https://dummyjson.com/posts?limit=${limit}&skip=${offset}`)
      .then(r => r.json())
      .then(r => setPosts(r.posts));
  }, [limit, currentPage]);

  function nextPage() {
    setCurrentPage(currentPage + 1);
  }

  function prevPage() {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }

  return (
    <>
      <select onChange={(e) => setLimit(Number(e.target.value))}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
      </select>

      {posts.map(x => (
        <h3 key={x.id}>{x.title} 
          <a href={'#/posts/' + x.id} onClick={e => { e.preventDefault(); setPostId(x.id); }}>&gt;&gt;</a>
        </h3>
      ))}

      <div>
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={nextPage}>Next</button>
      </div>
    </>
  );
}


function PostDetail({ postId, setPostId }) {
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [username, setUsername] = useState("");

  // Verileri getirme
  async function getData() {
    const postData = await fetch('https://dummyjson.com/posts/' + postId).then(r => r.json());
    const commentsData = await fetch(`https://dummyjson.com/posts/${postId}/comments`).then(r => r.json());

    // localStorage'da kaydedilmiş yorumları da alıyoruz
    setPost(postData);
    setComments([...commentsData.comments, ...JSON.parse(localStorage.getItem(`comments_${postId}`)) || []]);
  }

  useEffect(() => {
    getData();
  }, [postId]);

  // Yorum ekleme
  function handleSubmit(e) {
    e.preventDefault();
    if (!username || !newComment) return; // Kullanıcı adı ve yorum zorunlu

    const newCommentData = {
      id: crypto.randomUUID(),
      user: { fullName: username },
      body: newComment,
    };

    const updatedComments = [...comments, newCommentData];
    setComments(updatedComments);
    
    // Yorumları localStorage'a kaydetme
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments));

    // Formu sıfırlama
    setNewComment("");
    setUsername("");
  }

  return (
    <>
      <p><a href="#" onClick={e => { e.preventDefault(); setPostId(null); }}>back</a></p>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
      <hr />
      <h4>Comments: </h4>
      {comments.map(x => (
        <p key={x.id}><strong>{x.user.fullName}</strong> says: {x.body}</p>
      ))}

      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Your Name" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Add a comment" 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)} 
          required 
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}



function NotFound() {
  return (
    <p>Page not found. <a href="#/">return home</a></p>
  )
}

export default App
