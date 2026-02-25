import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import { REACT_APP_API_HOST } from '../../../util/constants';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  url = `${REACT_APP_API_HOST}/graphql`;
  method = 'POST';

  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphqlQuery = {
      query: `{ getPost(postId: "${postId}") { _id title content imageUrl creator { _id name } createdAt updatedAt } }`
    };

    fetch(this.url, {
      method: this.method,
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
          data: { getPost: post }
        } = resData;
        this.setState({
          title: post.title,
          author: post.creator.name,
          image: `${REACT_APP_API_HOST}/${post.imageUrl}`,
          date: new Date(post.createdAt).toLocaleDateString('en-US'),
          content: post.content
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className='single-post'>
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className='single-post__image'>
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
