import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import App from '../App';

// components the app should render.
import PostListComponent from '../Components/PostLists';
import { PostComponent, PageComponent } from '../Components/Page';

import { setFetchFunction } from '../BlogAPI/Fetch';
import Route from 'route-parser';

import { addResponse, getResponse } from '../TestHelper/MockFetch';
import { ErrorComponent } from '../App';

/*
 * Create a set of API responses.
 *
 * Remember to prefix responses with /r/.
 * By my convention, RESTful APIs are at /r/.
 */
// Posts is a common list of posts that will be in multiple responses.
const posts = [
    {
        title: "mockery",
        url: "/posts/2017/03/mockery.json",
        date: "2017-03-03 20:20:20-07:00",
        slug: "mockery",
        summary: "mocked up test post",
        authors: [],
        tags: [{ name: "mock", slug: "mock", url:"/tag/mock.json"}],
        categories: [{ name: "fake", slug: "mock", url:"/category/fake.json"}],
    }
]
addResponse("/r/", {
    title: "All Posts",
    source: "mock page index",
    slug: "index",
    post_count: 1,
    page_count: 1,
    page_number: 1,
    posts: posts
})
addResponse("/r/post/2017/03/mockery", {
    title: "mockery",
    url: "/posts/2017/03/mockery.json",
    date: "2017-03-03 20:20:20-07:00",
    slug: "mockery",
    summary: "mocked up test post",
    authors: [],
    tags: [{ name: "mock", slug: "mock", url:"/tag/mock.json"}],
    categories: [{ name: "fake", slug: "fake", url:"/categoryags/fake.json"}],
})
addResponse("/r/page/jester", {
    title: "mockery",
    url: "/posts/2017/03/mockery.json",
    date: "2017-03-03 20:20:20-07:00",
    slug: "mockery",
    summary: "mocked up test post",
    content: "content is here"
})
addResponse("/r/tag/mock", {
    title: "Posts with tag 'mock'",
    name: "mock",
    slug: "mock",
    url:"/category/mock.json",
    post_count: 1,
    page_count: 1,
    page_number: 1,
    posts: posts
})
addResponse("/r/category/fake", {
    title: "Posts in Category 'fake'",
    name: "fake",
    slug: "fake",
    url:"/category/fake.json",
    post_count: 1,
    page_count: 1,
    page_number: 1,
    posts: posts
});

addResponse("/r/tag/index", [
    {
      name: 'mock',
      slug: 'mock',
      url: 'tag/mock',
      post_count: 1,
    }

]);

// We *must have* a category tree and tag list response
addResponse("/r/category/index__tree", {
    tree: {
      fake: {
        "fake/test-thing": null
      }
    },
    categories: {
      "fake": {
        article_count: 1,
        name: "fake",
        shortname: "fake",
        slug: "fake",
        url: "category/dev.json",
      },
      "fake/test": {
        article_count: 1,
        name: "fake/test thing",
        shortname: "test thing",
        slug: "fake/test-thing",
        url: "category/fake/test-thing.json",
      }
    }
})

function mkTimeoutPromise(conditionFunction, waitTime=5, max=5) {
  return new Promise(async(resolve) => {
    for(let i=0; i < max; i++) {
      if (conditionFunction()) {
        resolve()
      } else {
        await new Promise(resolve=>setTimeout(()=>{resolve()}, waitTime))
      }
    }
  });
}

function expectOneComponent(wrapper, expected) {
  const componentList = [
    PostListComponent.PostList,
    PostListComponent.TaggedPosts,
    PostListComponent.CategoryPosts,
    PageComponent,
    PostComponent,
  ]
  for (let component of componentList) {
    expect(wrapper.find(component).exists()).toBe(component === expected);
  }

}

describe('<App>', () => {

    it('renders without crashing', () => {
      const div = document.createElement('div');
      const wrapper = shallow(<App />, div);
    });

    it('renders / with a PostList', async () => {
      const div = document.createElement('div');
      var wrapper = shallow(<App location="/" />, div);
      // We need to wait for the asychronous code.
      await mkTimeoutPromise(()=>{
        wrapper = wrapper.update();
        return wrapper.state().hasLoaded;
      });
      expectOneComponent(wrapper, PostListComponent.PostList);
      // check that data has been loaded.
      wrapper = wrapper.update();
      // check state content
      const state = wrapper.state();
      expect(state.data.postList.slug).toEqual('index');
    });

    it('renders /tag/mock with a TaggedPosts', async () => {
      const div = document.createElement('div');
      var wrapper = shallow(<App location="/tag/mock" />, div);

      // We need to wait for the asychronous code.
      await mkTimeoutPromise(()=>{
        wrapper = wrapper.update();
        return wrapper.state().hasLoaded;
      });
      expectOneComponent(wrapper, PostListComponent.TaggedPosts);
      // check state content
      const state = wrapper.state();
      expect(state.data.tag.slug).toEqual("mock");
    });

    it('renders /category/fake with a CategoryPosts', async () => {
      const div = document.createElement('div');
      var wrapper = shallow(<App location="/category/fake" />, div);

      // We need to wait for the asychronous code.
      await mkTimeoutPromise(()=>{
        wrapper = wrapper.update();
        return wrapper.state().hasLoaded;
      });
      expectOneComponent(wrapper, PostListComponent.CategoryPosts);
      const state = wrapper.state();
      expect(state.data.category.slug).toEqual("fake");
    });

    it('renders /post/2017/03/mockery with a PostComponent', async () => {
      const div = document.createElement('div');
      var wrapper = shallow(<App location="/post/2017/03/mockery" />, div);

      // We need to wait for the asychronous code.
      await mkTimeoutPromise(()=>{
        wrapper = wrapper.update();
        return wrapper.state().hasLoaded;
      });
      expectOneComponent(wrapper, PostComponent);
      const state = wrapper.state();
      expect(state.data.post.date.getFullYear()).toEqual(2017);
      expect(state.data.post.slug).toEqual("mockery");
    });

    it('renders /page/jester with a PageComponent', async () => {
      const div = document.createElement('div');
      var wrapper = shallow(<App location="/page/jester" />, div);

      // We need to wait for the asychronous code.
      await mkTimeoutPromise(()=>{
        wrapper = wrapper.update();
        return wrapper.state().hasLoaded;
      });
      expectOneComponent(wrapper, PageComponent);
    });

    it('renders /dne/broken with a ErrorComponent', async () => {
      const div = document.createElement('div');
      var wrapper = shallow(<App location="/dne/broken" />, div);

      // We need to wait for the asychronous code.
      await mkTimeoutPromise(()=>{
        wrapper = wrapper.update();
        return wrapper.state().hasLoaded;
      });
      expectOneComponent(wrapper, ErrorComponent);
      const state = wrapper.state();
      expect(state.error).toEqual({ message: "unknown request: /dne/broken", location: undefined});
    });


})
