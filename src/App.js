import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { APIPostList, APIPost, APICategory, APITag } from './BlogAPI/APIObjects';

class ComponentItemList extends Component {
  render() {
    const listObj = this.listObj
    if (!listObj.posts) {
      return <div>Waiting for post list</div>
    }
    const posts = listObj.posts.map((postS)=>{
      const catCount = postS.categories.length;
      var catNum = 0;
      const categoryWidget = postS.categories.map((cat)=>{
        catNum++;
        return <React.Fragment key={cat.url}>
          { catNum > 1 && catNum <= catCount && <span className="Comp-separator">/</span>}
        <span><a onClick={this.props.getCategory} data-url={cat.url}>{cat.shortname}</a></span>
        </React.Fragment>
      })
      console.log("have postS: ", postS)
      const tagWidget = postS.tags.map((tag)=>{
        return <React.Fragment key={tag.url}>
        <div className="Comp-meta-inline Comp-author"><a onClick={this.props.getTag} data-url={tag.url}>{tag.name}</a></div>
        </React.Fragment>
      })
      const authorWidget = postS.authors.map((author)=>{
        return <React.Fragment key={author.url}>
        <div className="Comp-meta-inline Comp-meta-author"><a onClick={this.props.getAuthor} data-url={author.url}>{author.name}</a></div>
        </React.Fragment>
      })
      return <div className="Comp-in-list" key={postS.url}>
        <dl>
          <dt>{postS.title}</dt>
          <dd>
            <dl>
              <dt>Summary:</dt>
              <dd dangerouslySetInnerHTML={{__html: postS.summary}} />
            </dl>
            <div className="Comp-meta">
              <div>Categories: {categoryWidget}</div>
              <div>Tags: {tagWidget}</div>
              <div>Authors: {authorWidget}</div>
            </div>
          </dd>
        </dl>
      </div>
    })
    return (<div className="Comp">
      PostList {listObj.page_number}/{listObj.page_count}
      {posts}
    </div>);
  }
}

class ComponentPost extends Component { render() { return (<div>Post</div>); } }
class ComponentPostList extends ComponentItemList {
  get listObj() { return this.props.data.postList }
}
class ComponentTag extends ComponentItemList {
  get listObj() { return this.props.data.tag }
}
class ComponentTagList extends Component { render() { return (<div>TagList</div>); } }
class ComponentCategory extends ComponentItemList {
  get listObj() { return this.props.data.category }
}
class ComponentCategoryList extends Component { render() { return (<div>CategoryList</div>); } }

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: 0,
      show: {
        post: false,
        postList: true,
        tag: false,
        tagList: false,
        category: false,
        categoryList: false,
      },
      data: {
        postList: new APIPostList(),
        post: new APIPost(),
        tag: new APITag(),
        category: new APICategory(),
      }
    }
    this.getCategory = this.getWidget.bind(this, "category");
    this.getTag = this.getWidget.bind(this, "tag");
    this.getAuthor = this.getWidget.bind(this, "author");
  }
  componentDidMount() {
    console.log("did mount!")
    //update the state to triger a re-render.
    this.state.data.postList.get().then(()=>this.setState({ refresh: this.state.refresh + 1 }));
    console.log("her data fetched", this.state.data)
    // const post = new APIPost({url:"posts/2017/03/page-content-comparison-selenium.json"});
    // post.get()
    // .then((data)=>{
    //   console.log("her data fetched", data)
    //   this.setState({ "d": data })
    // }).catch((error)=>{
    //   console.log("her data fetched", error)
    //   return 
    // });
  }

  getWidget(name, event) {
    console.log("get "+ name, event.currentTarget.dataset.url)
    var obj = this.state.data[name];
    if (obj) {
      obj.data.url = event.currentTarget.dataset.url;
      obj.get()
        .then(()=>{
          console.log("her data fetched", this.state.data)
          this.showWidget(name)
        });
    } else {
      throw Error("unknown widget: "+name)
    }
  }
  showWidget(name) {
    var show = this.state.show;
    for (var widget in this.state.show) {
      show[widget] = widget===name;
    }
    this.setState({show: show})
  }
  render() {
    const events = {
      getCategory: this.getCategory,
      getTag: this.getTag,
      getAuthor: this.getAuthor
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React (r{this.state.refresh})</h1>
        </header>
        <div className="App-content">
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        { this.state.show.post && <ComponentPost {...events} data={this.state.data} show={this.state.show}/> }
        { this.state.show.postList && <ComponentPostList {...events} data={this.state.data} show={this.state.show}/> }
        { this.state.show.tag && <ComponentTag {...events} data={this.state.data} show={this.state.show}/> }
        { this.state.show.tagList && <ComponentTagList show={this.state.show}/> }
        { this.state.show.category && <ComponentCategory {...events} data={this.state.data} show={this.state.show}/> }
        { this.state.show.categoryList && <ComponentCategoryList show={this.state.show}/> }
        </div>
      </div>
    );
  }
}

export default App;
