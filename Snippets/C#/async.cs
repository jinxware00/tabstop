using System;
using System.Threading.Tasks;

class Api {
    ⟦public static async Task<string> LoadAsync(string id) {
        var result = await GetDataAsync(id);
        return result.Trim().ToUpperInvariant();
    }⟧
}
