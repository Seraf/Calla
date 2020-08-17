using Calla.Data;

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using System;
using System.Linq;
using System.Threading.Tasks;

namespace Calla.Controllers
{
    static class PageViewsExt
    {
        public static StringCount[] ValueCount<T>(this DbSet<T> set, Func<T, string> select)
            where T : class
        {
            return set.Select(select)
                .GroupBy(v => v)
                .Select(g => new StringCount
                {
                    Value = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(c => c.Count)
                .ThenBy(c => c.Value)
                .ToArray();
        }
    }

    public class PageViewsController : Controller
    {
        private readonly ILogger<PageViewsController> logger;
        private readonly IWebHostEnvironment env;
        private readonly CallaContext db;

        public PageViewsController(ILogger<PageViewsController> logger, IWebHostEnvironment env, CallaContext db)
        {
            this.logger = logger;
            this.env = env;
            this.db = db;
        }

        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public ActionResult Index()
        {
            if (!env.IsDevelopment())
            {
                return NotFound();
            }

            var views = db.PageViews
                .OrderBy(v => v.From)
                .ThenBy(v => v.Timestamp)
                .ToArray();

            return View(views);
        }

        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public ActionResult Referrers()
        {
            if (!env.IsDevelopment())
            {
                return NotFound();
            }

            return View(db.PageViews.ValueCount(pv => pv.Referrer));
        }

        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public ActionResult UserAgents()
        {
            if (!env.IsDevelopment())
            {
                return NotFound();
            }

            return View(db.PageViews.ValueCount(pv => pv.UserAgent));
        }

        [HttpDelete]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<ActionResult> Index([FromBody] int id)
        {
            if (!env.IsDevelopment())
            {
                return NotFound();
            }

            var pvs = db.PageViews.Where(v => v.Id == id);
            db.PageViews.RemoveRange(pvs);
            await db.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
    }
}