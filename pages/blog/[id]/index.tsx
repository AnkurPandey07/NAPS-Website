import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "./blog.module.css"
import {GetStaticPaths, GetStaticProps} from 'next'
type apiResponse = {
  _id: string,
  title: string,
  author: string,
  createdAt: string,
  tags: string[],
  likes: number,
  thumbnail: string,
  content: string,
  category: string,
  summary: string,
  _v: number
  authorName: string,
  message?:string;
}
export default function Blog({blogData}:{blogData: apiResponse}){
  if(blogData.message){
    return <div className={styles.errorContainer}>
      <Head>
        <title>Blog Not Found | NAPS</title>
      </Head>
      <div className={styles.errorHeading}>
        Invalid URL
      </div>
      error message - 
      <code className={styles.errorCode}>
        {blogData.message}
      </code>
    </div>
  }
  const dateToFormat = new Date(blogData.createdAt)
  var dd = String(dateToFormat.getDate()).padStart(2, '0');
  var mm = String(dateToFormat.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = dateToFormat.getFullYear();
  const showableDate = dd + '/' + mm + '/' + yyyy;
  const isValidURL = (url:string)=>{
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(url);
  }
  return(
    <>
      <Head>
        <title>{blogData.title} | NAPS</title>
      </Head>
    <div className={`${styles.blogContainer} p-8 sm:px-16 md:px-24 lg:px-32 xl:px-40 2xl:px-48 my-5 mx-auto`}>
      <div className={styles.title}>{blogData.title}</div>
      <div className={styles.author}>
        <Link href={`/Author/${blogData.author}`}>
        {blogData.authorName}
        </Link>
      {` at ${showableDate}`}
      </div>
      <div className={`${styles.thumbnail} relative rounded-lg border border-slate-200 shadow-sm overflow-hidden`}>
        <Image src={isValidURL(blogData.thumbnail)?blogData.thumbnail:"https://images.unsplash.com/photo-1653031419232-c3c7c7eba0cd?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470"} alt="news-image" layout="fill"/>
      </div>
      <div className="block w-max tracking-wide text-slate-100 text-md font-bold mb-2 bg-slate-600 p-4 rounded-md shadow-md">
        {blogData.category}
      </div>
      <div className="flex flex-row gap-2 flex-wrap">
        {blogData.tags.map((tag)=><div key={tag} className="block uppercase tracking-wide text-gray-700 text-xs font-bold shadow-sm mb-2 bg-gray-200 p-4 rounded-md">
            <Link href={`/blog/tag/${tag}`}>
            {tag}
            </Link>
          </div>
        )}
      </div>
      <div className={styles.content} dangerouslySetInnerHTML={{
        __html: blogData.content.replace(/%2F/gi, "/"),
      }}>
      </div>
    </div>
    </>
  )

}
export const getStaticProps:GetStaticProps = async(context)=>{
  const id = context.params.id
  const url = `${process.env.APIBASE}/blog/id/${id}`
  const res = await fetch(url)
  const data: apiResponse = await res.json()
  // console.log(data)
  return {
    props: {blogData: data},
    revalidate: 120
  }
}
export const getStaticPaths:GetStaticPaths = async ()=>{
  const res = await fetch(`${process.env.APIBASE}/blog`);
  const data = await res.json();
  var paths = [];
  // console.log(data)
  data.forEach(item => {
    paths.push({params: {id: item._id}})
  });
  return {
    paths: paths,
    fallback: "blocking"
  }
}