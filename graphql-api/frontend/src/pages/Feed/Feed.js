import React, { Component, Fragment } from 'react';

import Button from '../../components/Button/Button';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Post from '../../components/Feed/Post/Post';
import Input from '../../components/Form/Input/Input';
import Loader from '../../components/Loader/Loader';
import Paginator from '../../components/Paginator/Paginator';
import { PAGE_SIZE, REACT_APP_API_HOST } from '../../util/constants';
import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const url = `${REACT_APP_API_HOST}/graphql`;
    const method = 'POST';

    const graphqlQuery = { query: `{ status }` };

    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then((res) => res.json())

      .then((resData) => {
        if (resData?.errors?.length) {
          throw new Error(resData.errors[0].message);
        }

        const {
          data: { status }
        } = resData;

        this.setState({ status });
      })
      .catch(this.catchError);

    this.loadPosts();
  }

  deletePost = (postId) => {
    this.setState((prevState) => {
      const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
      return { posts: updatedPosts, postsLoading: false };
    });
  };

  loadPosts = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }

    const url = `${REACT_APP_API_HOST}/graphql`;
    const method = 'POST';
    const graphqlQuery = {
      query: `query { posts { posts { _id title content creator { _id name } createdAt } totalPosts } }`
    };

    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.errors?.length) {
          throw new Error(resData.errors[0].message);
        }

        const {
          data: {
            posts: { posts, totalPosts }
          }
        } = resData;

        this.setState({
          posts: posts.map((post) => ({
            ...post,
            imagePath: post.imageUrl
          })),
          totalPosts,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = (event) => {
    event.preventDefault();

    fetch(`${REACT_APP_API_HOST}/feed/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: this.state.status })
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = (postData) => {
    this.setState({
      editLoading: true
    });
    const { title, content, image } = postData;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', image);

    let url = `${REACT_APP_API_HOST}/graphql`;
    let method = 'POST';

    const graphqlQuery = {
      query: `mutation { createPost(postInput: { title: "${title}" content: "${content}" imageUrl: "some-url"}) { _id title content imageUrl creator { name } createdAt } }`
    };

    fetch(url, {
      method,
      body: JSON.stringify(graphqlQuery),
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.errors?.length) {
          throw new Error(resData.errors[0].message);
        }

        const { data: createPost } = resData;
        const post = {
          _id: createPost.post._id,
          title: createPost.post.title,
          content: createPost.post.content,
          creator: createPost.post.creator,
          createdAt: createPost.post.createdAt
        };
        // this.setState((prevState) => {
        //   let updatedPosts = [...prevState.posts];
        //   if (prevState.editPost) {
        //     const postIndex = prevState.posts.findIndex(
        //       (p) => p._id === prevState.editPost._id
        //     );
        //     updatedPosts[postIndex] = post;
        //   } else if (prevState.posts.length < PAGE_SIZE) {
        //     updatedPosts = prevState.posts.concat(post);
        //   }
        //   return {
        //     posts: updatedPosts,
        //     isEditing: false,
        //     editPost: null,
        //     editLoading: false
        //   };
        // });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });
    let url = `${REACT_APP_API_HOST}/feed/post/${postId}`;
    let method = 'DELETE';

    fetch(url, {
      method,
      headers: { Authorization: `Bearer ${this.props.token}` }
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        }
        return res.json();
      })
      // .then((resData) => {
      // this.setState((prevState) => {
      //   const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
      //   return { posts: updatedPosts, postsLoading: false };
      // });
      // })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className='feed__status'>
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type='text'
              placeholder='Your status'
              control='input'
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode='flat' type='submit'>
              Update
            </Button>
          </form>
        </section>
        <section className='feed__control'>
          <Button mode='raised' design='accent' onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className='feed'>
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / PAGE_SIZE)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
