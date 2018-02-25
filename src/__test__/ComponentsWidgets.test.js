/*
 * SidebarComponent.test.js
 *
 * 
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';

import { TagWidget, CategoryWidget, PostListItemWidget } from '../Components/Widgets';

function getAThing(props) { }

function returnit(params) { return params }

const tagList1 = [
        {
            name: "t1",
            url: "route/target.json",
            post_count: 10,
            urlFor: returnit.bind('this', "route/target")
        },
];
const tagList2 = [
        {
            name: "t1",
            url: "route/target.json",
            post_count: 10,
            urlFor: returnit.bind('this', "route/target")
        },
        {
            name: "t2",
            url: "route/target2.json",
            post_count: 20,
            urlFor: returnit.bind('this', "route/target2")
        },
];
const categoryList1 = [
        {
            name: "t1",
            shortname: "t1",
            url: "route/target.json",
            post_count: 10,
            urlFor: returnit.bind('this', "route/target")
        },
];
const categoryList2 = [
        {
            name: "t1/t2",
            shortname: "t2",
            url: "route/t1/t2.json",
            post_count: 10,
            urlFor: returnit.bind('this', "route/t1/t2")
        },
        {
            name: "t1",
            shortname: "t1",
            url: "route/t1.json",
            post_count: 20,
            urlFor: returnit.bind('this', "route/t1")
        },
];

describe('<TagWidget>', () => {

    describe('renders without crashing', () => {
      const div = document.createElement('div');
        const wrapper = mount(<TagWidget 
            tags={tagList1}
            getTag={getAThing}
        />, div);
    });

    describe('render 1 tag', () => {
        // prepare the widget.
        const div = document.createElement('div');
        const wrapper = mount(<TagWidget 
            tags={tagList1}
            getTag={getAThing}
        />, div);
        // find the items in the ilst.
        const myList = wrapper.find(PostListItemWidget)

        test("has 1 result", () => {
            expect(myList.length).toEqual(1);
        });

        test("child div", ()=> {
            expect.assertions(7);
            myList.children().forEach((div)=>{
                // We should have a <div><a/></div>.
                expect(div.is('div')).toBe(true);
                expect(div.props().className).toEqual("Post-meta-inline Post-tag");
                const linkElement = div.find('a');
                expect(linkElement.name()).toBe('a');
                const props = linkElement.props();
                expect(props.title).toBe('Tag T1, 10 posts');
                expect(props.onClick).toBe(getAThing);
                expect(props.href).toBe("route/target");
                expect(props['data-target']).toBe("route/target");
            });
        })
    });

    describe('render 2 tags, colorized', () => {
        // prepare the widget.
        const div = document.createElement('div');
        const wrapper = mount(<TagWidget 
            tags={tagList2}
            getTag={getAThing}
            colorizeMax={20}
        />, div);
        // find the items in the ilst.
        const myList = wrapper.find(PostListItemWidget)

        test("has 2 result", () => {
            expect(myList.length).toEqual(2);
        });
        console.log(wrapper.debug())

        var child1 = wrapper.childAt(0)
        test("first child", ()=> {
            expect.assertions(8);
            // We should have a <div><a/></div>.
            expect(child1.is(PostListItemWidget)).toBe(true);
            child1 = child1.childAt(0);
            expect(child1.name()).toBe('div');
            expect(child1.props().className).toEqual("Post-meta-inline Post-tag Tag-50");
            const linkElement = child1.childAt(0);
            expect(linkElement.name()).toBe('a');
            const props = linkElement.props();
            expect(props.title).toBe('Tag T1, 10 posts');
            expect(props.onClick).toBe(getAThing);
            expect(props.href).toBe("route/target");
            expect(props['data-target']).toBe("route/target");
        })

        var child2 = wrapper.childAt(1)
        test("second child", ()=> {
            expect.assertions(8);
            // We should have a <div><a/></div>.
            expect(child2.is(PostListItemWidget)).toBe(true);
            child2 = child2.childAt(0);
            expect(child2.name()).toBe('div');
            expect(child2.props().className).toEqual("Post-meta-inline Post-tag Tag-100");
            const linkElement = child2.childAt(0);
            expect(linkElement.name()).toBe('a');
            const props = linkElement.props();
            expect(props.title).toBe('Tag T2, 20 posts');
            expect(props.onClick).toBe(getAThing);
            expect(props.href).toBe("route/target2");
            expect(props['data-target']).toBe("route/target2");
        })
    });

    describe('render 2 tags with separator', () => {
        // prepare the widget.
        const div = document.createElement('div');
        const wrapper = mount(<TagWidget 
            tags={tagList2}
            getTag={getAThing}
            separator="!"
        />, div);
        // find the items in the ilst.
        const myList = wrapper.find(PostListItemWidget)

        test("has 2 result", () => {
            expect(myList.length).toEqual(2);
        });

        var child1 = wrapper.childAt(0)
        test("first child", ()=> {
            expect.assertions(8);
            // We should have a <div><a/></div>.
            expect(child1.is(PostListItemWidget)).toBe(true);
            const tagElement = child1.childAt(0);
            expect(tagElement.name()).toBe('div');
            expect(tagElement.props().className).toEqual("Post-meta-inline Post-tag");
            const linkElement = tagElement.childAt(0);
            expect(linkElement.name()).toBe('a');
            const props = linkElement.props();
            expect(props.title).toBe('Tag T1, 10 posts');
            expect(props.onClick).toBe(getAThing);
            expect(props.href).toBe("route/target");
            expect(props['data-target']).toBe("route/target");
        })

        var child2 = wrapper.childAt(1)
        test("second child", ()=> {
            expect.assertions(9);
            // We should have a <div><a/></div>.
            expect(child2.is(PostListItemWidget)).toBe(true);
            var separator = child2.childAt(0);
            expect(separator.name()).toBe('span');
            const tagElement = child2.childAt(1);
            expect(tagElement.name()).toBe('div');
            expect(tagElement.props().className).toEqual("Post-meta-inline Post-tag");
            const linkElement = tagElement.childAt(0);
            expect(linkElement.name()).toBe('a');
            const props = linkElement.props();
            expect(props.title).toBe('Tag T2, 20 posts');
            expect(props.onClick).toBe(getAThing);
            expect(props.href).toBe("route/target2");
            expect(props['data-target']).toBe("route/target2");
        })
    });
});

describe('<CategoryWidget>', () => {

    describe('renders without crashing', () => {
      const div = document.createElement('div');
        const wrapper = mount(<CategoryWidget 
            categories={categoryList1}
            getCategory={getAThing}
        />, div);
    });

    describe('render 1 category', () => {
        // prepare the widget.
        const div = document.createElement('div');
        const wrapper = mount(<CategoryWidget 
            categories={categoryList1}
            getCategory={getAThing}
        />, div);
        // find the items in the ilst.
        const myList = wrapper.find(PostListItemWidget)

        test("has 1 result", () => {
            expect(myList.length).toEqual(1);
        });

        test("child div", ()=> {
            expect.assertions(7);
            myList.children().forEach((div)=>{
                // We should have a <div><a/></div>.
                expect(div.is('div')).toBe(true);
                expect(div.props().className).toEqual("Post-meta-inline Post-category");
                const linkElement = div.find('a');
                expect(linkElement.name()).toBe('a');
                const props = linkElement.props();
                expect(props.title).toBe('Category T1, 10 posts');
                expect(props.onClick).toBe(getAThing);
                expect(props.href).toBe("route/target");
                expect(props['data-target']).toBe("route/target");
            });
        })
    });

    describe('render 2 categories, colorized', () => {
        // prepare the widget.
        const div = document.createElement('div');
        const wrapper = mount(<CategoryWidget 
            categories={categoryList2}
            getCategory={getAThing}
            colorizeMax={20}
        />, div);
        // find the items in the ilst.
        const myList = wrapper.find(PostListItemWidget)

        test("has 2 result", () => {
            expect(myList.length).toEqual(2);
        });

        // items are sorted, so t1 comes before t1/t2.
        // This means we should get 
        var child1 = wrapper.childAt(0)
        test("first child", ()=> {
            expect.assertions(8);
            // We should have a <div><a/></div>.
            expect(child1.is(PostListItemWidget)).toBe(true);
            child1 = child1.childAt(0);
            expect(child1.name()).toBe('div');
            expect(child1.props().className).toEqual("Post-meta-inline Post-category Tag-100");
            const linkElement = child1.childAt(0);
            expect(linkElement.name()).toBe('a');
            const props = linkElement.props();
            expect(props.title).toBe('Category T1, 20 posts');
            expect(props.onClick).toBe(getAThing);
            expect(props.href).toBe("route/t1");
            expect(props['data-target']).toBe("route/t1");
        })

        var child2 = wrapper.childAt(1)
        test("second child", ()=> {
            expect.assertions(8);
            // We should have a <div><a/></div>.
            expect(child2.is(PostListItemWidget)).toBe(true);
            child2 = child2.childAt(0);
            expect(child2.name()).toBe('div');
            expect(child2.props().className).toEqual("Post-meta-inline Post-category Tag-50");
            const linkElement = child2.childAt(0);
            expect(linkElement.name()).toBe('a');
            const props = linkElement.props();
            expect(props.title).toBe('Category T2, 10 posts');
            expect(props.onClick).toBe(getAThing);
            expect(props.href).toBe("route/t1/t2");
            expect(props['data-target']).toBe("route/t1/t2");
        })
    });

    describe('render 2 categories with separator', () => {
        // prepare the widget.
        const div = document.createElement('div');
        const wrapper = mount(<CategoryWidget 
            categories={categoryList2}
            getCategory={getAThing}
            separator="!"
        />, div);
        // find the items in the ilst.
        const myList = wrapper.find(PostListItemWidget)

        test("has 2 result", () => {
            expect(myList.length).toEqual(2);
        });

        var child1 = wrapper.childAt(0)
        test("first child", ()=> {
            expect.assertions(8);
            // We should have a <div><a/></div>.
            expect(child1.is(PostListItemWidget)).toBe(true);
            const categoryElement = child1.childAt(0);
            expect(categoryElement.name()).toBe('div');
            expect(categoryElement.props().className).toEqual("Post-meta-inline Post-category");
            const linkElement = categoryElement.childAt(0);
            expect(linkElement.name()).toBe('a');
            const props = linkElement.props();
            expect(props.title).toBe('Category T1, 20 posts');
            expect(props.onClick).toBe(getAThing);
            expect(props.href).toBe("route/t1");
            expect(props['data-target']).toBe("route/t1");
        })

        var child2 = wrapper.childAt(1)
        test("second child", ()=> {
            expect.assertions(9);
            // We should have a <div><a/></div>.
            expect(child2.is(PostListItemWidget)).toBe(true);
            var separator = child2.childAt(0);
            expect(separator.name()).toBe('span');
            const categoryElement = child2.childAt(1);
            expect(categoryElement.name()).toBe('div');
            expect(categoryElement.props().className).toEqual("Post-meta-inline Post-category");
            const linkElement = categoryElement.childAt(0);
            expect(linkElement.name()).toBe('a');
            const props = linkElement.props();
            expect(props.title).toBe('Category T2, 10 posts');
            expect(props.onClick).toBe(getAThing);
            expect(props.href).toBe("route/t1/t2");
            expect(props['data-target']).toBe("route/t1/t2");
        })
    });
});