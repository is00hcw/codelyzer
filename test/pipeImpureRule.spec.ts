import {assertFailure, assertSuccess} from './testHelper';

describe('pipe-impure', () => {
    describe('impure pipe', () => {
        it('should fail when Pipe is impure', () => {
            let source = `
                      @Pipe({
                        pure: false
                      })
                      class Test {}`;
            assertFailure('pipe-impure', source, {
                message: 'Warning: impure pipe declared in class Test.',
                startPosition: {
                    line: 2,
                    character: 24
                },
                endPosition: {
                    line: 2,
                    character: 35
                }
            });
        });
    });

    describe('pure pipe', () => {
        it('should succeed when Pipe is pure', () => {
            let source = `
                    @Pipe({
                      pure: true
                    })
                    class Test {}`;
            assertSuccess('pipe-impure', source);
        });
    });

    describe('default pipe', () => {
        it('should succeed when Pipe pure property is not set', () => {
            let source = `
                    @Pipe({
                      name: 'testPipe'
                    })
                    class Test {}`;
            assertSuccess('pipe-impure', source);
        });
    });
});
