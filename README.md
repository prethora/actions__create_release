# Create Release javascript action

This action creates a release from a push with a tag reference.

## Inputs

## `token`

**Required** The GITHUB api access token.

## Outputs

## `response`

The response from the successful create release api call.

## Example usage

    - name: Create Release  
      id: create_release
      uses: prethora/actions__create_release@v1.0
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
    - name: Get the response
      run: echo "The response: ${{ steps.create_release.outputs.response }}"
