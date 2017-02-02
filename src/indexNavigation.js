
let headerContent=`
<style media="screen">
  .debugging-navigation {
    position: fixed;
    bottom: 0;
    right: 0;
    background: rgba(0,0,0,0.1);
    padding: 3px;
    z-index: 9999;
  }
  .debugging-navigation li {
    display: block;
    margin: 8px;
  }
  .debugging-navigation li a {
    display: inline-block;
    margin: 2px;
    background: rgba(0,0,0,0.2);
    padding: 5px;
    width: 7em;
    color: black;
    text-align: center;
    text-decoration: none;
  }
  .debugging-navigation li a:hover {
    background: rgba(0,0,0,0.4);
  }
</style>
<ul class="debugging-navigation">
  <li>
    <a href="/index.html">TextOnly</a>
    <a href="/indexTextOnlyPreview.html">Preview Data</a>
  </li>
  <li>
    <a href="/indexImagesFresh.html?tid=2000">Images</a>
    <a href="/indexImagesPreview.html?tid=2000">Preview Data</a></li>
</ul>
`

document.open()
document.write(headerContent)
document.close()